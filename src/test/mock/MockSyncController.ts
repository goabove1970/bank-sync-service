import "jest";
import { BankConnection } from "@root/src/models/bank-connection";
import { BankAdaptorBase } from "@root/src/models/bank-adaptor-base";
import { ofxResponse } from "@root/src/models/ofx-response";
import { MockBankAdaptorBase } from "./MockBankAdaptorBase";
import { BankConnectionStats } from "@root/src/models/bank-connection-stats";
import { AccountType } from "@root/src/models/accounts/Account";
import { ofxTransaction } from "@root/src/models/ofx-transaction";
import { SyncController } from "@root/src/controllers/sync-controller/sync-controller";
import { TransactionImprtResult } from "@root/src/controllers/transaction-processor-controller/transaction-import-result";

export class MockableSyncControllerContext {
  mockGetConnectionStatusResponse: ofxResponse;
  constructor() {
    this.mockGetConnectionStatusResponse = getDefaultConnectionStatusResponse();
  }
  clearState(): void {
    // Clear mockable state
  }
}

export const getDefaultConnectionStatusResponse: () => ofxResponse = () => {
  const result: ofxResponse = {
    accounts: [],
  };

  return result;
};

export const mockableSyncControllerArgs = new MockableSyncControllerContext();

const MockExecuteSync = jest.fn(
  (
    userId?: string,
    connectionId?: string,
    force?: boolean
  ): Promise<BankConnection[]> => {
    const res: BankConnection[] = [];
    return Promise.resolve(res);
  }
);

const MockGetBankAdapter = jest.fn(
  (conn: BankConnection): BankAdaptorBase => {
    // calls original class's method

    const instance: BankAdaptorBase = new MockBankAdaptorBase();
    return instance;
  }
);

const MockGetConnectionStatus = jest.fn(
  (conn: BankConnection): Promise<ofxResponse> => {
    const resp = mockableSyncControllerArgs.mockGetConnectionStatusResponse;
    return Promise.resolve(resp);
  }
);

const MockSyncConnection = jest.fn(
  (conn: BankConnection, sessionId: string): Promise<BankConnectionStats> => {
    throw "Not implemented";
  }
);

const MockSyncTransactions = jest.fn(
  (
    transactions: ofxTransaction[],
    accountId: string,
    accountType: AccountType
  ): Promise<TransactionImprtResult> => {
    throw "Not implemented";
  }
);

const mockMethodUndefined = jest.fn(() => {
  throw "Method not implemented, try using spyOn(object, \"method name\").and.callThrough();";
});

export const MockSyncController = jest.fn<SyncController, []>(() => ({
  executeSync: MockExecuteSync,
  getBankAdapter: MockGetBankAdapter,
  getConnectionStatus: MockGetConnectionStatus,
  syncConnection: MockSyncConnection,
  syncTransactions: MockSyncTransactions,
  createNewAccount: mockMethodUndefined,
  createNewAccountFromOld: mockMethodUndefined,
  getOldAccount: mockMethodUndefined,
  syncTransactionsCreateNewAccount: mockMethodUndefined,
  syncTransactionsExistingAccount: mockMethodUndefined,
  syncTransactionsOldAccount: mockMethodUndefined,
  transactionProcessor: undefined,
  accountCache: undefined,
  accountController: undefined,
  bankController: undefined,
  getNewTransactions: undefined,
}));
