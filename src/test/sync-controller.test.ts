import { SyncController } from '../controllers/sync-controller';
import { AccountData } from '../models/account-data';
import { AccountType, UserAccount } from '../models/accounts/Account';
import { AccountStatus } from '../models/accounts/AccountStatus';
import { BankConnection } from '../models/bank-connection';
import { BankAccountPollStatus, BankConnectionStats } from '../models/bank-connection-stats';
// import {  BankConnectionStats } from '../models/bank-connection-stats';
// import { BankAccountPollStatus, BankConnectionStats } from '../models/bank-connection-stats';
import { BankConnectionStatus } from '../models/bank-connection-status';
// import { ofxAccount } from '../models/ofx-account';
import { ofxResponse } from '../models/ofx-response';
// import { ofxTransaction } from '../models/ofx-transaction';
const fs = require('fs');
import {
  mockableAccountArgs,
  MockAccountController,
} from './mock/MockAccountController';
import {
  MockableAccountData,
  mockableBankAdaptorData,
  MockableOfxResponse,
} from './mock/MockBankAdaptorBase';
import {
  mockableBankConnectiondsArgs,
  MockBankController,
} from './mock/MockBankController';
// import { MockSyncController } from './mock/MockSyncController';
import { MockTransactionProcessor } from './mock/MockTransactionProcessor';

const loadSyncResponse = (filename: string) => {
  let res = {

  };
  if (fs.existsSync(filename)) {
    try {
      const data = fs.readFileSync(filename, {encoding:'utf8', flag:'r'});
      res = JSON.parse(data);
    } catch (error) {
      console.log(`Can't read BankConnectionStats from file: ${error.message || error}`);
    }
  }

  return res;
}

describe('SyncController', () => {
  // let mockSyncController: SyncController;

  beforeEach(() => {
    // mockSyncController = new MockSyncController();
  });

  // it.skip(`Should poll accounts with transactions on syncing bank connection`, async () => {
  //   const userId = 'user_id';
  //   const accountId = 'account-id';

  //   const transactionProcessor = new MockTransactionProcessor();
  //   const accountController = new MockAccountController();
  //   const bankController = new MockBankController();
  //   const controller = new SyncController(
  //     transactionProcessor,
  //     accountController,
  //     bankController
  //   );

  //   // setup OFX bank data
  //   mockableBankAdaptorData.mockOfxResponse = new MockableOfxResponse();
  //   mockableBankAdaptorData.mockOfxResponse.accounts = [];
  //   const bankAccount: ofxAccount = {
  //     accountId: 'bank-account-id-1234345364657',
  //     acctype: 'DEBIT',
  //     bankId: 'bank-id-sdf456234',
  //   };
  //   mockableBankAdaptorData.mockOfxResponse.accounts.push(bankAccount);
  //   mockableBankAdaptorData.mockOfxResponse.statusData = {};
  //   mockableBankAdaptorData.acctData = new MockableAccountData();
  //   mockableBankAdaptorData.acctData.transactions = [];
  //   const transaction: ofxTransaction = {
  //     amount: 100,
  //     datePosted: new Date(2020, 4, 16),
  //     transactionType: 'transaction-type',
  //     fitid: 'transaction-fitid',
  //     memo: 'transaction-memo',
  //     name: 'transaction-name',
  //   };
  //   mockableBankAdaptorData.acctData.transactions.push(transaction);
  //   mockableBankAdaptorData.acctData.transactionsCount = 1;

  //   mockableAccountArgs.mockAccountCollection = [];

  //   const userAccount: UserAccount = {
  //     accountId,
  //     bankAccountNumber: 'bank-account-number',
  //     bankName: 'MOCK',
  //     userId,
  //     status: AccountStatus.Active,
  //   };
  //   mockableAccountArgs.mockAccountCollection.push(userAccount);

  //   const sessionId = 'session-id';
  //   const connection: BankConnection = {
  //     bankName: 'MOCK',
  //     userId,
  //     login: 'login',
  //     password: 'password',
  //     connectionId: '2234546',
  //     status: BankConnectionStatus.Active | BankConnectionStatus.Validated,
  //   };

  //   // TESTING HERE
  //   const syncConnectionResult = await controller.syncConnection(
  //     connection,
  //     sessionId
  //   );
  //   expect(syncConnectionResult.userId).toEqual(userId);
  //   expect(syncConnectionResult.bankConnectionId).toEqual(
  //     connection.connectionId
  //   );
  //   expect(syncConnectionResult.syncSessionId).toEqual(sessionId);
  // });

  // it.skip(`Should poll accounts on syncing bank connection`, async () => {
  //   const userId = 'user_id';
  //   const accountId = 'account-id';
  //   const transactionProcessor = new MockTransactionProcessor();
  //   const accountController = new MockAccountController();
  //   const bankController = new MockBankController();
  //   const controller = new SyncController(
  //     transactionProcessor,
  //     accountController,
  //     bankController
  //   );

  //   // setup OFX bank data
  //   mockableBankAdaptorData.mockOfxResponse = new MockableOfxResponse();
  //   mockableBankAdaptorData.mockOfxResponse.accounts = [];
  //   const bankAccount: ofxAccount = {
  //     accountId: 'bank-account-id-1234345364657',
  //     acctype: 'DEBIT',
  //     bankId: 'bank-id-sdf456234',
  //   };
  //   mockableBankAdaptorData.mockOfxResponse.accounts.push(bankAccount);
  //   mockableBankAdaptorData.mockOfxResponse.statusData = {};
  //   mockableBankAdaptorData.acctData = new MockableAccountData();
  //   mockableBankAdaptorData.acctData.transactions = [];
  //   const transaction: ofxTransaction = {
  //     amount: 100,
  //     datePosted: new Date(2020, 4, 16),
  //     transactionType: 'transaction-type',
  //     fitid: 'transaction-fitid',
  //     memo: 'transaction-memo',
  //     name: 'transaction-name',
  //   };
  //   mockableBankAdaptorData.acctData.transactions.push(transaction);
  //   mockableBankAdaptorData.acctData.transactionsCount = 1;

  //   mockableAccountArgs.mockAccountCollection = [];

  //   const userAccount: UserAccount = {
  //     accountId,
  //     bankAccountNumber: 'bank-account-number',
  //     bankName: 'MOCK',
  //     userId,
  //     status: AccountStatus.Active,
  //   };
  //   mockableAccountArgs.mockAccountCollection.push(userAccount);

  //   const connection: BankConnection = {
  //     bankName: 'MOCK',
  //     userId,
  //     login: 'login',
  //     password: 'password',
  //     connectionId: '2234546',
  //     status: BankConnectionStatus.Active | BankConnectionStatus.Validated,
  //   };

  //   const executeSyncResult: BankConnection[] = await controller.executeSync(
  //     userId,
  //     connection.connectionId,
  //     true
  //   );
  //   expect(executeSyncResult.length).toEqual(1);
  // });

  it(`Should poll accounts on syncing bank connection`, async () => {
    const transactionProcessor = new MockTransactionProcessor();
    const accountController = new MockAccountController();
    const bankController = new MockBankController();
    const controller = new SyncController(
      transactionProcessor,
      accountController,
      bankController
    );

    // retrieve mock OXF bank data
    
    const ofxAccountsPath = 'src/test/mock/data/ofxAcounts.json';
    const mockAccountsData: ofxResponse = loadSyncResponse(ofxAccountsPath) as ofxResponse;
    expect(mockAccountsData).not.toBeUndefined()

    // setup OFX bank data
    mockableBankAdaptorData.mockOfxResponse = new MockableOfxResponse();
    mockableBankAdaptorData.mockOfxResponse.accounts = [];
    expect(mockAccountsData.accounts).not.toBeUndefined()
    mockableBankAdaptorData.mockOfxResponse.accounts = mockAccountsData.accounts;
    expect(mockAccountsData.statusData).not.toBeUndefined()
    mockableBankAdaptorData.mockOfxResponse.statusData = {};
    mockableBankAdaptorData.acctData = new Map<string, AccountData>();

    const mockResponsePath = 'src/test/mock/data/mockSynckResponse.json';
    const moackTransactionsData: BankConnectionStats = loadSyncResponse(mockResponsePath);
    expect(moackTransactionsData).not.toBeUndefined()
    expect(moackTransactionsData.accounts).not.toBeUndefined()

    moackTransactionsData.accounts.forEach((acct: BankAccountPollStatus) => {
      mockableBankAdaptorData.acctData[acct.accountNumber] = new MockableAccountData();
      mockableBankAdaptorData.acctData[acct.accountNumber].transactions = acct.accountData.transactions;
      mockableBankAdaptorData.acctData[acct.accountNumber].transactionsCount = acct.accountData.transactions.length;
    });
    
    // 2. Existing in database
    // 2.1 User's bank account's tied to this usedId
    const userAccount: UserAccount = {
      accountId: '766bc1ab-8b57-7f11-2e7c-eed123cd3cb7',
      bankAccountNumber: '4266841594977983',
      bankRoutingNumber: '4266841594977983',
      bankName: 'MOCK',
      userId: '26a89c19-f32b-de23-85ca-4a8929c61e36',
      status: AccountStatus.Active,
      accountType: AccountType.Credit,
      alias: 'FREEDOM',
      cardNumber: '4266841594977983',
      createDate: new Date(2020, 5, 5),
    };
    mockableAccountArgs.mockAccountCollection = [];
    mockableAccountArgs.mockAccountCollection.push(userAccount);

    // 2.2 Bank connection from database to be synched
    const connection: BankConnection = {
      bankName: 'MOCK',
      userId: '26a89c19-f32b-de23-85ca-4a8929c61e36',
      login: 'goabove1970',
      password: 'K8cu5SaE97Kc2w9V3f37R5fkwwyapfh',
      connectionId: '7b244d70-ad54-f501-9708-c6932a0ad420',
      status: BankConnectionStatus.Active | BankConnectionStatus.Validated,
    };
    mockableBankConnectiondsArgs.mockBankConnectionsCollection = [];
    mockableBankConnectiondsArgs.mockBankConnectionsCollection.push(connection);

    const executeSyncResult: BankConnection[] = await controller.executeSync(
      connection.userId,
      connection.connectionId,
      true
    );
    expect(executeSyncResult.length).toEqual(1);
  });
});
