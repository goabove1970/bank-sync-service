import 'jest';
import { BankConnection } from '@root/src/models/bank-connection';
import { BankPollController } from '@root/src/controllers/bank-controller';
import { BankAdaptorBase } from '@root/src/models/bank-adaptor-base';
import { ofxResponse } from '@root/src/models/ofx-response';
import { MockBankAdaptorBase } from './MockBankAdaptorBase';
import { BankAccountPollStatus, BankConnectionStats } from '@root/src/models/bank-connection-stats';
import { AccountResponseModel } from '@root/src/controllers/account-controller/AccountResponseModel';
import { TransactionImprtResult } from '@root/src/controllers/transaction-processor-controller/TransactionProcessor';

export const mockableBankConnectiondsArgs: { mockBankConnectionsCollection: BankConnection[] } = {
    mockBankConnectionsCollection: [],
};

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

const MockExecuteSync = jest.fn((userId?: string, connectionId?: string, force?: boolean):
    Promise<BankConnection[]> => {
    const res: BankConnection[] = [];
    return Promise.resolve(res);
});

const MockGetBankAdapter = jest.fn((conn: BankConnection): BankAdaptorBase => {
    // calls original class's method
    
    const instance: BankAdaptorBase = new MockBankAdaptorBase();
    return instance;
});

const MockGetConnectionStatus = jest.fn((conn: BankConnection): Promise<ofxResponse> => {
    let resp: ofxResponse;
    return Promise.resolve(resp);
});

const MockSyncConnection = jest.fn((conn: BankConnection, sessionId: string): Promise<BankConnectionStats> => {
   throw "Not implemented";
});

const MockSyncTransactions = jest.fn((acctDataFromBank: BankAccountPollStatus,
    uac: AccountResponseModel): Promise<TransactionImprtResult> => {
   throw "Not implemented";
});

export const MockPollController = jest.fn<BankPollController, []>(() => ({
    executeSync: MockExecuteSync,
    getBankAdapter: MockGetBankAdapter,
    getConnectionStatus: MockGetConnectionStatus,
    syncConnection: MockSyncConnection,
    syncTransactions: MockSyncTransactions
}));
