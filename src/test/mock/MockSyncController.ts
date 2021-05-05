import "jest";
import { BankConnection } from "@root/src/models/bank-connection";
import { SyncController } from "@root/src/controllers/sync-controller";
import { BankAdaptorBase } from "@root/src/models/bank-adaptor-base";
import { ofxResponse } from "@root/src/models/ofx-response";
import { MockBankAdaptorBase } from "./MockBankAdaptorBase";
import {
  BankAccountPollStatus,
  BankConnectionStats,
} from "@root/src/models/bank-connection-stats";
import { AccountResponseModel } from "@root/src/controllers/account-controller/AccountResponseModel";
import { TransactionImprtResult } from "@root/src/controllers/transaction-processor-controller/TransactionProcessor";

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

// const getCollection: () => BankConnection[] = () => {
//     return mockableBankConnectiondsArgs.mockBankConnectionsCollection;
// };

// const updateItem = (item: BankConnection) => {
//     const index = getCollection().findIndex((e) => e.connectionId === item.connectionId);
//     if (index !== -1) {
//         getCollection()[index] = item;
//     }
// };

// const deleteItem = (key: string) => {
//     const index = getCollection().findIndex((e) => e.connectionId === key);
//     if (index > -1) {
//         getCollection().splice(index, 1);
//     }
// };

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
    acctDataFromBank: BankAccountPollStatus,
    uac: AccountResponseModel
  ): Promise<TransactionImprtResult> => {
    throw "Not implemented";
  }
);

export const MockSyncController = jest.fn<SyncController, []>(() => ({
  executeSync: MockExecuteSync,
  getBankAdapter: MockGetBankAdapter,
  getConnectionStatus: MockGetConnectionStatus,
  syncConnection: MockSyncConnection,
  syncTransactions: MockSyncTransactions,
  accountController: undefined,
  transactionProcessor: undefined,
  bankController: undefined,
  accountTransactionCache: undefined,
  getOldAccount: undefined,
  cacheHasExpired: undefined,
}));
