import { AccountController } from "../controllers/account-controller/account-controller";
import { BankController } from "../controllers/bank-controller";
import { AccountTransactionsCache } from "../controllers/sync-controller/model/account-cache/account-cache";
import { SyncController } from "../controllers/sync-controller/sync-controller";
import {
  transactionsMatch,
  transactionsMatchOfx,
} from "../controllers/sync-controller/utils/findMatchingOfxTransaction";
import bankAdaptorFabric from "../controllers/sync-controller/utils/getBankAdapter";
import { toCommonTransaciton } from "../controllers/sync-controller/utils/toCommonTransaction";
import { TransactionProcessor } from "../controllers/transaction-processor-controller/call-through-transaction-processor";
import { AccountData } from "../models/account-data";
import { AccountType, UserAccount } from "../models/accounts/Account";
import { AccountStatus } from "../models/accounts/AccountStatus";
import { BankConnection } from "../models/bank-connection";
import {
  BankAccountPollStatus,
  BankConnectionStats,
} from "../models/bank-connection-stats";
import { BankConnectionStatus } from "../models/bank-connection-status";
import { ofxAccount } from "../models/ofx-account";
import { ofxResponse } from "../models/ofx-response";
import { ofxTransaction } from "../models/ofx-transaction";
import {
  getAccountResponseFrame,
  getCreditAccountSaphireSample,
} from "./mock/data/generateMockAcountsResponse";
import {
  getMockCreditAccountSapphire,
  getMockSyncResponse,
} from "./mock/data/mockSynckResponse";
import {
  mockableAccountArgs,
  MockAccountController,
} from "./mock/MockAccountController";
import {
  MockableAccountData,
  mockableBankAdaptorData,
  MockableOfxResponse,
  MockBankAdaptorBase,
} from "./mock/MockBankAdaptorBase";
import {
  mockableBankConnectiondsArgs,
  MockBankController,
} from "./mock/MockBankController";
import {
  mockableTransactionProcessorArgs,
  MockTransactionProcessor,
} from "./mock/MockTransactionProcessor";

describe("SyncController", () => {
  describe("when getting exitsint ofc account from bank", () => {
    const transactionsNeededToMatchAccounts = 20;
    const userId = "26a89c19-f32b-de23-85ca-4a8929c61e36";
    const syncSessionId = "5bf22687-4ac6-b373-1a02-1fcc4e0d7f1d";
    const bankConnectionId = "7b244d70-ad54-f501-9708-c6932a0ad420";
    const accountId = "766bc1ab-8b57-7f11-2e7c-eed123cd3cb7";
    const sapphireAccountNumber = "4266841594977983";
    const userLogin = "goabove1970";
    const userPassword = "K8cu5SaE97Kc2w9V3f37R5fkwwyapfh";
    const sapphireAccount: ofxAccount = getCreditAccountSaphireSample();
    const sapphireAccountData = getMockCreditAccountSapphire(
      sapphireAccount.accountId
    );

    let controller: SyncController;
    let accountCache: AccountTransactionsCache;
    let bankController: BankController;
    let accountController: AccountController;
    let transactionProcessor: TransactionProcessor;

    beforeEach(() => {
      transactionProcessor = new MockTransactionProcessor();
      accountController = new MockAccountController();
      bankController = new MockBankController();
      accountCache = new AccountTransactionsCache(transactionProcessor);
      controller = new SyncController(
        transactionProcessor,
        accountController,
        bankController,
        accountCache
      );

      mockableAccountArgs.mockAccountCollection = [];
      mockableTransactionProcessorArgs.transactions = [];

      spyOn(bankAdaptorFabric, "getBankAdapter").and.returnValue(
        new MockBankAdaptorBase()
      );
    });

    it("should add new transactions from ofc account to existing account", async () => {
      const mockAccountsData: ofxResponse = getAccountResponseFrame([
        sapphireAccount,
      ]);
      // setup OFX bank data
      mockableBankAdaptorData.mockOfxResponse = new MockableOfxResponse();
      mockableBankAdaptorData.mockOfxResponse.accounts =
        mockAccountsData.accounts;
      mockableBankAdaptorData.mockOfxResponse.statusData = {};
      mockableBankAdaptorData.acctData = new Map<string, AccountData>();

      const mockTransactionsData: BankConnectionStats = getMockSyncResponse(
        userId,
        syncSessionId,
        bankConnectionId
      );
      mockTransactionsData.accounts.push(sapphireAccountData);
      mockTransactionsData.accounts.forEach((acct: BankAccountPollStatus) => {
        mockableBankAdaptorData.acctData[
          acct.accountNumber
        ] = new MockableAccountData();
        mockableBankAdaptorData.acctData[acct.accountNumber].transactions =
          acct.accountData.transactions;
        mockableBankAdaptorData.acctData[acct.accountNumber].transactionsCount =
          acct.accountData.transactions.length;
      });
      // 2. Existing in database
      // 2.1 User's bank account's tied to this usedId
      const userAccount: UserAccount = {
        accountId,
        bankAccountNumber: sapphireAccountNumber,
        bankRoutingNumber: sapphireAccountNumber,
        bankName: "MOCK",
        userId,
        status: AccountStatus.Active,
        accountType: AccountType.Credit,
        alias: "FREEDOM",
        cardNumber: sapphireAccountNumber,
        createDate: new Date(2020, 5, 5),
      };

      mockableAccountArgs.mockAccountCollection.push(userAccount);
      // 2.2 Bank connection from database to be synched
      const connection: BankConnection = {
        bankName: "MOCK",
        userId,
        login: userLogin,
        password: userPassword,
        connectionId: bankConnectionId,
        status: BankConnectionStatus.Active | BankConnectionStatus.Validated,
      };
      mockableBankConnectiondsArgs.mockBankConnectionsCollection = [];
      mockableBankConnectiondsArgs.mockBankConnectionsCollection.push(
        connection
      );
      spyOn(controller, "syncTransactionsExistingAccount").and.callThrough();
      spyOn(controller, "syncTransactionsCreateNewAccount").and.callThrough();
      spyOn(controller, "syncTransactionsOldAccount").and.callThrough();

      const executeSyncResult: BankConnection[] = await controller.executeSync(
        connection.userId,
        connection.connectionId,
        true
      );

      expect(executeSyncResult.length).toEqual(1);
      expect(controller.syncTransactionsExistingAccount).toBeCalledTimes(1);
      expect(controller.syncTransactionsOldAccount).toBeCalledTimes(0);
      expect(controller.syncTransactionsCreateNewAccount).toBeCalledTimes(0);

      const mockDbTransactions = mockableTransactionProcessorArgs.transactions;
      const polledTransactions: ofxTransaction[] =
        sapphireAccountData.accountData.transactions;

      // expect all of the polled transactions to be added
      polledTransactions.forEach((ofxtr: ofxTransaction) => {
        if (ofxtr.datePosted) {
          const addedTransaction = mockDbTransactions.find((tr) =>
            transactionsMatch(tr, ofxtr)
          );
          if (!addedTransaction) {
            console.log(
              `Transaction has not been imported: ${JSON.stringify(ofxtr)}`
            );
          }
          expect(addedTransaction).not.toBeUndefined();
        }
      });

      // expect all of the polled transactions to be in poll result
      const syncData: BankConnection = executeSyncResult[0];
      expect(syncData).not.toBeUndefined();
      expect(syncData.lastPollStats.accounts[0].recordsPolled).toEqual(
        polledTransactions.length
      );
      expect(
        syncData.lastPollStats.accounts[0].syncData.newTransactions
      ).toEqual(polledTransactions.length);
      expect(syncData.lastPollStats.accounts[0].syncData.duplicates).toEqual(0);
      const importedTransactions: ofxTransaction[] =
        syncData.lastPollStats.accounts[0].accountData.transactions;
      polledTransactions.forEach((ofxtr: ofxTransaction) => {
        if (ofxtr.datePosted) {
          const addedTransaction = importedTransactions.find((tr) =>
            transactionsMatchOfx(tr, ofxtr)
          );
          if (!addedTransaction) {
            console.log(
              `Transaction has not been imported: ${JSON.stringify(ofxtr)}`
            );
          }
          expect(addedTransaction).not.toBeUndefined();
        }
      });
    });

    it(`should not recognize old account after card replacement if old account has less transactions than ${transactionsNeededToMatchAccounts}`, async () => {
      const mockAccountsData: ofxResponse = getAccountResponseFrame([
        sapphireAccount,
      ]);
      // setup OFX bank data
      mockableBankAdaptorData.mockOfxResponse = new MockableOfxResponse();
      mockableBankAdaptorData.mockOfxResponse.accounts =
        mockAccountsData.accounts;
      mockableBankAdaptorData.mockOfxResponse.statusData = {};
      mockableBankAdaptorData.acctData = new Map<string, AccountData>();

      const mockTransactionsData: BankConnectionStats = getMockSyncResponse(
        userId,
        syncSessionId,
        bankConnectionId
      );
      mockTransactionsData.accounts.push(sapphireAccountData);
      mockTransactionsData.accounts.forEach((acct: BankAccountPollStatus) => {
        mockableBankAdaptorData.acctData[
          acct.accountNumber
        ] = new MockableAccountData();
        mockableBankAdaptorData.acctData[acct.accountNumber].transactions =
          acct.accountData.transactions;
        mockableBankAdaptorData.acctData[acct.accountNumber].transactionsCount =
          acct.accountData.transactions.length;
      });
      // 2. Existing in database
      // 2.1 User's bank account's tied to this usedId

      // here we will modify account id in database
      const userAccount: UserAccount = {
        accountId: "some-account-id",
        bankAccountNumber: "some-account-number",
        bankRoutingNumber: sapphireAccountNumber,
        bankName: "MOCK",
        userId,
        status: AccountStatus.Active,
        accountType: AccountType.Credit,
        alias: "FREEDOM",
        cardNumber: sapphireAccountNumber,
        createDate: new Date(2020, 5, 5),
      };
      mockableAccountArgs.mockAccountCollection.push(userAccount);
      // 2.2 Bank connection from database to be synched
      const connection: BankConnection = {
        bankName: "MOCK",
        userId,
        login: userLogin,
        password: userPassword,
        connectionId: bankConnectionId,
        status: BankConnectionStatus.Active | BankConnectionStatus.Validated,
      };
      mockableBankConnectiondsArgs.mockBankConnectionsCollection = [];
      mockableBankConnectiondsArgs.mockBankConnectionsCollection.push(
        connection
      );
      spyOn(controller, "syncTransactionsExistingAccount").and.callThrough();
      spyOn(controller, "syncTransactionsCreateNewAccount").and.callThrough();
      spyOn(controller, "syncTransactionsOldAccount").and.callThrough();

      const executeSyncResult: BankConnection[] = await controller.executeSync(
        connection.userId,
        connection.connectionId,
        true
      );

      expect(executeSyncResult.length).toEqual(1);
      expect(controller.syncTransactionsExistingAccount).toBeCalledTimes(0);
      expect(controller.syncTransactionsOldAccount).toBeCalledTimes(0);
      expect(controller.syncTransactionsCreateNewAccount).toBeCalledTimes(1);

      const mockDbTransactions = mockableTransactionProcessorArgs.transactions;
      const polledTransactions: ofxTransaction[] =
        sapphireAccountData.accountData.transactions;

      // expect all of the polled transactions to be added
      polledTransactions.forEach((ofxtr: ofxTransaction) => {
        if (ofxtr.datePosted) {
          const addedTransaction = mockDbTransactions.find((tr) =>
            transactionsMatch(tr, ofxtr)
          );
          if (!addedTransaction) {
            console.log(
              `Transaction has not been imported: ${JSON.stringify(ofxtr)}`
            );
          }
          expect(addedTransaction).not.toBeUndefined();
        }
      });

      // expect all of the polled transactions to be in poll result
      const syncData: BankConnection = executeSyncResult[0];
      expect(syncData).not.toBeUndefined();
      expect(syncData.lastPollStats.accounts[0].recordsPolled).toEqual(
        polledTransactions.length
      );
      expect(
        syncData.lastPollStats.accounts[0].syncData.newTransactions
      ).toEqual(polledTransactions.length);
      expect(syncData.lastPollStats.accounts[0].syncData.duplicates).toEqual(0);
      const importedTransactions: ofxTransaction[] =
        syncData.lastPollStats.accounts[0].accountData.transactions;
      polledTransactions.forEach((ofxtr: ofxTransaction) => {
        if (ofxtr.datePosted) {
          const addedTransaction = importedTransactions.find((tr) =>
            transactionsMatchOfx(tr, ofxtr)
          );
          if (!addedTransaction) {
            console.log(
              `Transaction has not been imported: ${JSON.stringify(ofxtr)}`
            );
          }
          expect(addedTransaction).not.toBeUndefined();
        }
      });
    });

    it(`should recognize old account after card replacement if old account has more transactions than ${transactionsNeededToMatchAccounts}`, async () => {
      const oldAccountId = "old-account-id";
      const oldBankAccountNumber = "old-account-id";

      const mockAccountsData: ofxResponse = getAccountResponseFrame([
        sapphireAccount,
      ]);
      // setup OFX bank data
      mockableBankAdaptorData.mockOfxResponse = new MockableOfxResponse();
      mockableBankAdaptorData.mockOfxResponse.accounts =
        mockAccountsData.accounts;
      mockableBankAdaptorData.mockOfxResponse.statusData = {};
      mockableBankAdaptorData.acctData = new Map<string, AccountData>();

      const mockTransactionsData: BankConnectionStats = getMockSyncResponse(
        userId,
        syncSessionId,
        bankConnectionId
      );
      mockTransactionsData.accounts.push(sapphireAccountData);
      mockTransactionsData.accounts.forEach((acct: BankAccountPollStatus) => {
        mockableBankAdaptorData.acctData[
          acct.accountNumber
        ] = new MockableAccountData();
        mockableBankAdaptorData.acctData[acct.accountNumber].transactions =
          acct.accountData.transactions;
        mockableBankAdaptorData.acctData[acct.accountNumber].transactionsCount =
          acct.accountData.transactions.length;
      });
      // 2. Existing in database
      // 2.1 User's bank account's tied to this usedId

      // here we will modify account id in database
      const userAccount: UserAccount = {
        accountId: oldAccountId,
        bankAccountNumber: oldBankAccountNumber,
        bankRoutingNumber: sapphireAccountNumber,
        bankName: "MOCK",
        userId,
        status: AccountStatus.Active,
        accountType: AccountType.Credit,
        alias: "FREEDOM",
        cardNumber: sapphireAccountNumber,
        createDate: new Date(2020, 5, 5),
      };
      mockableAccountArgs.mockAccountCollection.push(userAccount);

      // fill with transactions
      for (let i = 0; i < transactionsNeededToMatchAccounts; i++) {
        mockableTransactionProcessorArgs.transactions.push(
          toCommonTransaciton(
            sapphireAccountData.accountData.transactions[i],
            oldAccountId,
            userAccount.accountType
          )
        );
      }

      // 2.2 Bank connection from database to be synched
      const connection: BankConnection = {
        bankName: "MOCK",
        userId,
        login: userLogin,
        password: userPassword,
        connectionId: bankConnectionId,
        status: BankConnectionStatus.Active | BankConnectionStatus.Validated,
      };
      mockableBankConnectiondsArgs.mockBankConnectionsCollection = [];
      mockableBankConnectiondsArgs.mockBankConnectionsCollection.push(
        connection
      );
      spyOn(controller, "syncTransactionsExistingAccount").and.callThrough();
      spyOn(controller, "syncTransactionsCreateNewAccount").and.callThrough();
      spyOn(controller, "syncTransactionsOldAccount").and.callThrough();

      const executeSyncResult: BankConnection[] = await controller.executeSync(
        connection.userId,
        connection.connectionId,
        true
      );

      expect(executeSyncResult.length).toEqual(1);
      expect(controller.syncTransactionsExistingAccount).toBeCalledTimes(0);
      expect(controller.syncTransactionsOldAccount).toBeCalledTimes(1);
      expect(controller.syncTransactionsCreateNewAccount).toBeCalledTimes(0);

      const mockDbTransactions = mockableTransactionProcessorArgs.transactions;
      const polledTransactions: ofxTransaction[] =
        sapphireAccountData.accountData.transactions;

      // expect all of the polled transactions to be added
      polledTransactions.forEach((ofxtr: ofxTransaction) => {
        if (ofxtr.datePosted) {
          const addedTransaction = mockDbTransactions.find((tr) =>
            transactionsMatch(tr, ofxtr)
          );
          if (!addedTransaction) {
            console.log(
              `Transaction has not been imported: ${JSON.stringify(ofxtr)}`
            );
          }
          expect(addedTransaction).not.toBeUndefined();
        }
      });

      // expect all of the polled transactions to be in poll result
      const syncData: BankConnection = executeSyncResult[0];
      expect(syncData).not.toBeUndefined();
      expect(syncData.lastPollStats.accounts[0].recordsPolled).toEqual(
        polledTransactions.length
      );
      expect(
        syncData.lastPollStats.accounts[0].syncData.newTransactions
      ).toEqual(polledTransactions.length - transactionsNeededToMatchAccounts);
      expect(syncData.lastPollStats.accounts[0].syncData.duplicates).toEqual(0);
      const importedTransactions: ofxTransaction[] =
        syncData.lastPollStats.accounts[0].accountData.transactions;
      polledTransactions.forEach((ofxtr: ofxTransaction) => {
        if (ofxtr.datePosted) {
          const addedTransaction = importedTransactions.find((tr) =>
            transactionsMatchOfx(tr, ofxtr)
          );
          if (!addedTransaction) {
            console.log(
              `Transaction has not been imported: ${JSON.stringify(ofxtr)}`
            );
          }
          expect(addedTransaction).not.toBeUndefined();
        }
      });
    });
  });
});
