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
import { bankController, BankController } from "../bank-controller";
import accountController, { AccountController } from "../account-controller";
import { AccountResponseModel } from "../account-controller/AccountResponseModel";
// import { inspect } from 'util';
import {
  TransactionImprtResult,
  transactionProcessor,
  TransactionProcessor,
} from "../transaction-processor-controller/TransactionProcessor";
import { getBankAdapter } from "./utils/getBankAdapter";
import { toCommonTransaciton } from "./utils/toCommonTransaction";
import {
  SortOrder,
  TransactionReadArg,
} from "@root/src/models/transaction/TransactionReadArgs";
import { Transaction } from "@root/src/models/transaction/Transaction";
import { ReadAccountArgs } from "@root/src/models/accounts/ReadAccountArgs";
import { ofxTransaction } from "@root/src/models/ofx-transaction";
import { findMatchingOfxTransaction } from "./utils/findMatchingOfxTransaction";

export class SyncController {
  transactionProcessor: TransactionProcessor;
  accountController: AccountController;
  bankController: BankController;
  constructor(
    transactionProcessor: TransactionProcessor,
    accountController: AccountController,
    bankController: BankController
  ) {
    this.transactionProcessor = transactionProcessor;
    this.accountController = accountController;
    this.bankController = bankController;
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

    const bankAdapter = getBankAdapter(conn);

    // poll bank acctounts for this bank connection
    let accounts = [];
    try {
      logger.info(
        `Requesting accounts for connection [${conn.connectionId}], bank [${conn.bankName}]. Session [${sessionId}].`
      );
      const acctData: ofxResponse = await bankAdapter.extractAccounts();
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
    const bankAdapter = getBankAdapter(conn);
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
      const conn = toBePolled[connIter];
      const connStatus = await syncController.syncConnection(conn, sessionId);
      conn.lastPollStats = connStatus;
      conn.lastPollDate = moment().toDate();

      if (connStatus.accounts) {
        for (let bcit = 0; bcit < connStatus.accounts.length; ++bcit) {
          const bacct = connStatus.accounts[bcit];
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

            if (matchingAccts && matchingAccts.length === 1) {
              // ofx acount is present in database
              const matchingAccount: AccountResponseModel = matchingAccts[0];
              const syncTransactionsData = await this.syncTransactions(
                bacct,
                matchingAccount
              );
              bacct.syncData = syncTransactionsData;
              bacct.syncCompleted = moment().toDate();
            } else {
              // 1. check if this is an old account with updated accout number (replaced credit card)
              // 1.1 extract last 20 transactions from database for this account
              // and check if they are present in the ofx response

              const oldAccount:
                | AccountResponseModel
                | undefined = await this.getOldAccount(
                conn.userId,
                bacct.accountData.transactions
              );
              if (oldAccount) {
                // this is an old account with new number (card replacement)
                const syncTransactionsData = await this.syncTransactions(
                  bacct,
                  oldAccount
                );
                bacct.syncData = syncTransactionsData;
                bacct.syncCompleted = moment().toDate();
              } else {
                // this is a new account
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

  accountTransactionCache: Map<
    string,
    {
      lastCacheTime: Date;
      transactions: Transaction[];
    }
  > = new Map<
    string,
    {
      lastCacheTime: Date;
      transactions: Transaction[];
    }
  >();

  getOldAccount = async (
    userId: string,
    ofxTransactions: ofxTransaction[]
  ): Promise<AccountResponseModel | undefined> => {
    const readAccountsArgs: ReadAccountArgs = {
      userId,
    };
    const userAccounts: AccountResponseModel[] = await this.accountController.read(
      readAccountsArgs
    );

    const oldAccount:
      | AccountResponseModel
      | undefined = await userAccounts.find(
      async (acct: AccountResponseModel) => {
        let accountCache: {
          lastCacheTime: Date;
          transactions: Transaction[];
        } = this.accountTransactionCache[acct.accountId];
        if (
          !accountCache ||
          !accountCache.lastCacheTime ||
          this.cacheHasExpired(accountCache.lastCacheTime)
        ) {
          const transactionReadArgs: TransactionReadArg = {
            accountId: acct.accountId,
            readCount: 20,
            order: SortOrder.descending,
          };
          const accountTransactions = (await this.transactionProcessor.readTransactions(
            transactionReadArgs
          )) as Transaction[];
          accountCache = {
            transactions: accountTransactions,
            lastCacheTime: moment().toDate(),
          };
          this.accountTransactionCache[acct.accountId] = accountCache;
        }
        const dbTransactions: Transaction[] = accountCache.transactions;

        const allTrnsactionsPresent = dbTransactions.every((f: Transaction) => {
          const matchingOfxTransaction = findMatchingOfxTransaction(
            ofxTransactions,
            f
          );
          return matchingOfxTransaction !== undefined;
        });
        if (allTrnsactionsPresent) {
          return true;
        }
        return false;
      }
    );

    return oldAccount;
  };

  cacheHasExpired = (cacheTime: Date) => {
    const expiresInHours = 10;
    const expirationTimestamp = moment(cacheTime).add(expiresInHours, "hour");
    const valid = moment().isBefore(expirationTimestamp);
    return !valid;
  };

  async syncTransactions(
    acctDataFromBank: BankAccountPollStatus,
    uac: AccountResponseModel
  ): Promise<TransactionImprtResult> {
    let result: TransactionImprtResult = {
      parsed: 0,
      duplicates: 0,
      newTransactions: 0,
      businessRecognized: 0,
      multipleBusinessesMatched: 0,
      unrecognized: 0,
      unposted: 0,
    };
    if (!acctDataFromBank.accountData) {
      return result;
    }

    if (
      !acctDataFromBank.accountData.transactions ||
      acctDataFromBank.accountData.transactionsCount === 0
    ) {
      return result;
    }

    const newTransactions = acctDataFromBank.accountData.transactions.map((t) =>
      toCommonTransaciton(t, uac)
    );
    result = await this.transactionProcessor.addTransactions(
      newTransactions,
      uac.accountId
    );
    return result;
  }
}

const syncController = new SyncController(
  transactionProcessor,
  accountController,
  bankController
);
export default syncController;
