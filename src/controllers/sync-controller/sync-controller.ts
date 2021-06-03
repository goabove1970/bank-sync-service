import { ofxResponse } from "@root/src/models/ofx-response";
import { BankConnection } from "@root/src/models/bank-connection";
import logger from "@root/src/logger";
import { BankAdaptorBase } from "@root/src/models/bank-adaptor-base";
import {
  BankConnectionStats,
  BankAccountPollStatus,
} from "@root/src/models/bank-connection-stats";
import {
  isConnectionActive,
  isSuspended,
  isCouldNotConnect,
  isValidated,
} from "@root/src/models/bank-connection-status";
import moment = require("moment");
import { GuidFull } from "@root/src/utils/generateGuid";
import { BankController } from "../bank-controller";
import { AccountController } from "../account-controller/account-controller";
import { AccountResponseModel } from "../account-controller/AccountResponseModel";
import bankAdaptorFabric from "./utils/getBankAdapter";
import {
  getOldestTransactionDate,
  ofxTransactionsHaveLastDbTransactions,
} from "./sync-controller-helper";
import { AccountTransactionsCache } from "./model/account-cache/account-cache";
import {
  AccountType,
  AccountTypeToString,
} from "@root/src/models/accounts/Account";
import { AccountUpdateArgs } from "@root/src/models/accounts/AccountUpdateArgs";
import { AccountStatus } from "@root/src/models/accounts/AccountStatus";
import { AccountCreateArgs } from "@root/src/models/accounts/AccountCreateArgs";
import { CreateAccountArgsForSyncing } from "./model/create-account-args-for-syncing";
import { ofxTransaction } from "@root/src/models/ofx-transaction";
import { toCommonTransaciton } from "./utils/toCommonTransaction";
import { ReadAccountArgs } from "@root/src/models/accounts/ReadAccountArgs";
import { transactionsMatch } from "./utils/findMatchingOfxTransaction";
import { Transaction } from "@root/src/models/transaction/Transaction";
import { TransactionProcessor } from "../transaction-processor-controller/call-through-transaction-processor";
import { TransactionImprtResult } from "../transaction-processor-controller/transaction-import-result";

export class SyncController {
  transactionProcessor: TransactionProcessor;
  accountController: AccountController;
  bankController: BankController;
  accountCache: AccountTransactionsCache;
  constructor(
    transactionProcessor: TransactionProcessor,
    accountController: AccountController,
    bankController: BankController,
    accountCache: AccountTransactionsCache
  ) {
    this.transactionProcessor = transactionProcessor;
    this.accountController = accountController;
    this.bankController = bankController;
    this.accountCache = accountCache;
  }

  async syncConnection(
    conn: BankConnection,
    sessionId: string
  ): Promise<BankConnectionStats> {
    await BankAdaptorBase.removeOldFiles();
    const syncStats: BankConnectionStats = {
      userId: conn.userId,
      syncSessionId: sessionId,
      bankConnectionId: conn.connectionId,
    };

    if (
      !isConnectionActive(conn.status) ||
      isSuspended(conn.status) ||
      isCouldNotConnect(conn.status) ||
      !isValidated(conn.status)
    ) {
      conn.lastPollStats = syncStats;
      conn.lastPollDate = moment().toDate();
      return syncStats;
    }

    const bankAdapter = bankAdaptorFabric.getBankAdapter(conn);

    // poll bank acctounts for this bank connection
    let accounts = [];
    try {
      logger.info(
        `Requesting accounts for connection [${conn.connectionId}], bank [${conn.bankName}]. Session [${sessionId}].`
      );
      const acctData: ofxResponse = await bankAdapter
        .extractAccounts()
        .catch((e) => {
          console.error(`Error while calling bank: ${e.message || e}`);
          throw e;
        });
      if (acctData.statusData) {
        logger.info(
          `Received [${acctData.statusData.severity}] for connection [${conn.connectionId}], bank [${conn.bankName}]. Session [${sessionId}].`
        );

        if (acctData.statusData.severity === "ERROR") {
          syncStats.bankConnectionError = acctData.statusData.message;
          syncStats.bankConnectionErrorCode = acctData.statusData.code;
        } else {
          accounts = acctData.accounts;
        }
      }
    } catch (e) {
      logger.error(
        `Error polling accounts for connection [${
          conn.connectionId
        }]: ${e.message || e}`
      );
      syncStats.bankConnectionError = e.message || e;
    }

    // iterate through accounts
    syncStats.accounts = [];
    for (let acctIter = 0; acctIter < accounts.length; acctIter++) {
      const account = accounts[acctIter];
      const acctStats: BankAccountPollStatus = {
        accountNumber: account.accountId,
        syncStarted: moment().toDate(),
      };
      syncStats.accounts.push(acctStats);
      try {
        logger.info(
          `Requesting data for account [${conn.connectionId}/${account.accountId}]. Session [${sessionId}].`
        );
        const accountData = await bankAdapter.getAccountData(account);
        logger.info(
          `Recevied ${accountData.transactions.length} for account [${conn.connectionId}/${account.accountId}]. Session [${sessionId}].`
        );
        acctStats.accountData = accountData;
        acctStats.recordsPolled = accountData.transactions.length;
        acctStats.syncCompleted = moment().toDate();
      } catch (e) {
        logger.error(
          `Error polling data for account [${conn.connectionId}/${account.accountId}]. Session [${sessionId}].`
        );
        acctStats.bankConnectionError = e.message || e;
      }
    }
    return syncStats;
  }

  async getConnectionStatus(conn: BankConnection): Promise<ofxResponse> {
    let response: ofxResponse = {};
    const bankAdapter = bankAdaptorFabric.getBankAdapter(conn);
    try {
      logger.info(
        `Validating connection [${conn.connectionId}], bank [${conn.bankName}].`
      );
      response = await bankAdapter.extractAccounts();
      if (response.statusData) {
        logger.info(
          `Received [${response.statusData.severity}] for connection [${conn.connectionId}], bank [${conn.bankName}].`
        );

        if (response.statusData.severity !== "ERROR") {
          response.accounts = response.accounts;
        }
      }
    } catch (e) {
      logger.error(
        `Error validating connection [${conn.connectionId}]: ${e.message || e}`
      );
    }
    return response;
  }

  async executeSync(
    userId?: string,
    connectionId?: string,
    force?: boolean
  ): Promise<BankConnection[]> {
    const sessionId = GuidFull();

    logger.info(`Starting hourly sync session [${sessionId}]`);
    const bankConnections = await this.bankController.read({
      connectionId,
      userId,
    });
    logger.info(
      `Extracted ${bankConnections.length} known connections from the database. Session [${sessionId}].`
    );

    const toBePolled = bankConnections.filter(
      (c) =>
        force ||
        !c.lastPollDate ||
        (c.lastPollDate &&
          moment(c.lastPollDate).isBefore(moment().subtract(1, "hour")))
    );
    logger.info(
      `Scheduling ${toBePolled.length} connections for polling. Session [${sessionId}].`
    );
    let userAccounts: AccountResponseModel[];
    if (userId) {
      userAccounts = await this.accountController.read({ userId });
    }

    for (let connIter = 0; connIter < toBePolled.length; connIter++) {
      const conn: BankConnection = toBePolled[connIter];
      const connStatus = await this.syncConnection(conn, sessionId);
      conn.lastPollStats = connStatus;
      conn.lastPollDate = moment().toDate();

      if (connStatus.accounts) {
        for (
          let acctIter = 0;
          acctIter < connStatus.accounts.length;
          acctIter++
        ) {
          const bacct: BankAccountPollStatus = connStatus.accounts[acctIter];
          // for (let bcit = 0; bcit < connStatus.accounts.length; ++bcit) {
          // const bacct = connStatus.accounts[bcit];
          bacct.syncStarted = moment().toDate();
          // now go through each connection,
          // poll associated user's accounts and try to add transactions

          if (conn.userId) {
            // try to find matching account for account data comming from bank connection
            userAccounts = await this.accountController.read({
              userId: conn.userId,
            });
            const matchingAccts = userAccounts.filter(
              (uac) =>
                uac.bankName === conn.bankName &&
                uac.bankAccountNumber === bacct.accountNumber
            );
            const activeAccountExistsInDatabase =
              matchingAccts && matchingAccts.length === 1;
            if (activeAccountExistsInDatabase) {
              const matchingAccount: AccountResponseModel = matchingAccts[0];
              await this.syncTransactionsExistingAccount(
                matchingAccount,
                bacct
              );
            } else {
              // 1. check if this is an old account with updated accout number
              // (replaced credit card)
              // 1.1 extract last 20 transactions from database for this account
              // and check if they are present in the ofx response
              const transactionsNeededToMatchAccounts = 20;
              const oldAccount:
                | AccountResponseModel
                | undefined = await this.getOldAccount(
                conn.userId,
                bacct.accountData.transactions,
                this.accountCache,
                transactionsNeededToMatchAccounts
              );
              if (oldAccount) {
                await this.syncTransactionsOldAccount(oldAccount, bacct);
              } else {
                await this.syncTransactionsCreateNewAccount(bacct, conn);
              }
            }
          }
        }
      }

      // updating last poll stats in database
      await this.bankController.update({
        ...conn,
      });
    }

    logger.info(`Sync session [${sessionId}] completed.`);
    return toBePolled;
  }

  syncTransactionsExistingAccount = async (
    matchingAccount: AccountResponseModel,
    bacct: BankAccountPollStatus
  ) => {
    // ofx acount is present in database
    const syncTransactionsData = await this.syncTransactions(
      (bacct && bacct.accountData && bacct.accountData.transactions) || [],
      matchingAccount.accountId,
      matchingAccount.accountType
    );
    bacct.syncData = syncTransactionsData;
    bacct.syncCompleted = moment().toDate();
  };

  syncTransactionsCreateNewAccount = async (
    bacct: BankAccountPollStatus,
    conn: BankConnection
  ) => {
    logger.info(
      `Discovered a new bank account number ${bacct.accountNumber} which is missing in database`
    );

    const args: CreateAccountArgsForSyncing = {
      // alias: `${bacct.accountData.description} ${bacct.accountData.accountId}`,
      alias: undefined,
      bankAccountNumber: bacct.accountData.accountId,
      bankName: conn.bankName,
      userId: conn.userId,
      bankRouting:
        bacct.accountData.accountType == "CHECKING"
          ? bacct.accountData.bankId
          : undefined,
    };
    const newAccountId = await this.createNewAccount(args);
    logger.info(
      `Registered a new account ${newAccountId} for account number ${bacct.accountNumber}`
    );

    // 4. Sync new transactions into the new account
    const acctType: AccountType =
      bacct.accountData.accountType == "CHECKING"
        ? AccountType.Checking
        : AccountType.Credit;
    const syncTransactionsData = await this.syncTransactions(
      bacct.accountData.transactions,
      newAccountId,
      acctType
    );
    bacct.syncData = syncTransactionsData;
    bacct.syncCompleted = moment().toDate();

    logger.info(
      `Inserted ${syncTransactionsData.newTransactions} into account number ${bacct.accountNumber}`
    );
  };

  syncTransactionsOldAccount = async (
    oldAccount: AccountResponseModel,
    bacct: BankAccountPollStatus
  ) => {
    logger.info(
      `Found matching account ${oldAccount.accountId} which has all ofx transactions`
    );

    const earliestTransactionInNewAccount = getOldestTransactionDate(
      bacct.accountData.transactions
    );

    // This is an old account with new number (card replacement). We should
    // (1) mark old account as closed and
    // (2) add a new account referring the old account

    // 1. Marking old account as closed (card replaced)
    let serviceComment = oldAccount.serviceComment;
    if (!serviceComment) {
      serviceComment = {
        replacedByAccount: bacct.accountNumber,
        closeDate: earliestTransactionInNewAccount.toDate(),
      };
    }
    const acctUpdArgs: AccountUpdateArgs = {
      accountId: oldAccount.accountId,
      status: (oldAccount.status || 0) | AccountStatus.CardReplaced,
      serviceComment: serviceComment,
    };
    await this.accountController.update(acctUpdArgs);
    logger.info(`Marked account ${oldAccount.accountId} as card replaced`);

    // 2. Creating a new bank account
    const newAccountId = await this.createNewAccountFromOld(
      bacct.accountNumber,
      oldAccount
    );
    logger.info(
      `Created now account account number: ${bacct.accountNumber}, acct_id: ${newAccountId}`
    );

    // 3. Get transactions which don't exist in old db account
    const newOfxTransactions = await this.getNewTransactions(
      bacct,
      oldAccount.accountId
    );
    logger.info(
      `Discovered ${newOfxTransactions.length} transactions which are missing from account ${oldAccount.bankAccountNumber} and need to be inserted for account number ${bacct.accountNumber}`
    );

    // 4. Sync new transactions into the new account
    const syncTransactionsData = await this.syncTransactions(
      newOfxTransactions,
      newAccountId,
      oldAccount.accountType
    );
    bacct.syncData = syncTransactionsData;
    bacct.syncCompleted = moment().toDate();

    logger.info(
      `Inserted ${syncTransactionsData.newTransactions} into account number ${bacct.accountNumber}`
    );
  };

  getNewTransactions = async (
    bacct: BankAccountPollStatus,
    oldAccountId: string
  ) => {
    let oldAccountAllTranactions = (await this.transactionProcessor.readTransactions(
      {
        accountId: oldAccountId,
      }
    )) as Transaction[];
    if (!bacct || !bacct.accountData || !bacct.accountData.transactions) {
      return [];
    }
    const filtered = bacct.accountData.transactions.filter(
      (oftr: ofxTransaction) => {
        const preseniInDatabase = oldAccountAllTranactions.some((tr) =>
          transactionsMatch(tr, oftr)
        );
        return !preseniInDatabase;
      }
    );

    return filtered;
  };

  createNewAccountFromOld = async (
    newCardNumber: string,
    oldAccount: AccountResponseModel
  ): Promise<string> => {
    const serviceComment = {
      replacesAccount: oldAccount.bankAccountNumber,
    };
    const acctCreateArgs: AccountCreateArgs = {
      bankAccountNumber: newCardNumber,
      accountType: AccountType.Credit,
      bankName: oldAccount.bankName,
      alias: oldAccount.alias ? `Replaces ${oldAccount.alias}` : undefined,
      bankRoutingNumber: oldAccount.bankRoutingNumber || newCardNumber,
      cardNumber: newCardNumber,
      serviceComment: serviceComment,
      userId: oldAccount.userId,
    };
    const newAccountId = await this.accountController.create(acctCreateArgs);
    return newAccountId;
  };

  getOldAccount = async (
    userId: string,
    ofxTransactions: ofxTransaction[],
    cache: AccountTransactionsCache,
    transactionsNeededToMatchAccounts: number
  ): Promise<AccountResponseModel | undefined> => {
    const readAccountsArgs: ReadAccountArgs = {
      userId,
    };
    const account = await this.accountController
      .read(readAccountsArgs)
      .then(async (userAccounts: AccountResponseModel[]) => {
        for (let acct of userAccounts) {
          const found = await ofxTransactionsHaveLastDbTransactions(
            acct.accountId,
            ofxTransactions,
            cache,
            transactionsNeededToMatchAccounts
          );
          if (found) {
            return acct;
          }
        }
        return undefined;
      });

    return account;
  };

  createNewAccount = async (
    args: CreateAccountArgsForSyncing
  ): Promise<string> => {
    const serviceComment = {
      serviceMessage: "Added automatically while synking",
    };
    const accountType = AccountType.Credit;
    const lastFourNumbres =
      args.bankAccountNumber && args.bankAccountNumber.length >= 4
        ? args.bankAccountNumber.substring(args.bankAccountNumber.length - 4)
        : args.bankAccountNumber;
    const alias = `${AccountTypeToString(accountType)}-${lastFourNumbres}`;
    const acctCreateArgs: AccountCreateArgs = {
      bankAccountNumber: args.bankAccountNumber,
      accountType: accountType,
      bankName: args.bankName,
      alias: args.alias && args.alias.length > 0 ? args.alias : alias,
      bankRoutingNumber: args.bankRouting || args.bankAccountNumber,
      cardNumber: args.bankAccountNumber,
      serviceComment: serviceComment,
      userId: args.userId,
    };
    const newAccountId = await this.accountController.create(acctCreateArgs);
    return newAccountId;
  };

  syncTransactions = async (
    transactions: ofxTransaction[],
    accountId: string,
    accountType: AccountType
  ): Promise<TransactionImprtResult> => {
    let result: TransactionImprtResult = {
      parsed: 0,
      duplicates: 0,
      newTransactions: 0,
      businessRecognized: 0,
      multipleBusinessesMatched: 0,
      unrecognized: 0,
      unposted: 0,
    };
    if (!transactions || transactions.length === 0) {
      return result;
    }

    const newTransactions = transactions.map((t) =>
      toCommonTransaciton(t, accountId, accountType)
    );
    try {
      result = await this.transactionProcessor.addTransactions(
        newTransactions,
        accountId
      );
    } catch (error) {
      logger.error(
        `Error occured while trying to transactionProcessor.addTransactions: ${error.message |
          error}`
      );
      throw error;
    }

    return result;
  };
}
