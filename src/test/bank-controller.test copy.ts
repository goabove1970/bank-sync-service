import { BankController } from '../controllers/bank-controller';
import { BankConnection } from '../models/bank-connection';
import { BankSyncArgs } from '../routes/connections-request';
import {
  MockBankController,
  mockableBankConnectiondsArgs as mockCollection,
} from './mock/MockBankController';

describe('BankConnectionController', () => {
  let mockController: BankController;

  beforeEach(() => {
    mockController = new MockBankController();
    mockCollection.mockBankConnectionsCollection = [];
  });

  it(`should create bank connection contoller`, async () => {
    const createArgs: BankConnection = {
      bankName: 'bank_name',
      userId: 'user_id',
      login: 'login',
      password: 'password',
      connectionId: '2234546',
    };

    await mockController.create(createArgs);
    const indexOf = mockCollection.mockBankConnectionsCollection.find(
      (acct) => acct.connectionId === createArgs.connectionId
    );
    expect(indexOf).not.toBeUndefined();
    expect(mockCollection.mockBankConnectionsCollection.length).toBe(1);
  });

  it(`should read by connection id`, async () => {
    const createArgs: BankConnection = {
      bankName: 'bank_name',
      userId: 'user_id',
      login: 'login',
      password: 'password',
      connectionId: '2234546',
    };

    await mockController.create(createArgs);

    const readAccountArgs: BankSyncArgs = {
      connectionId: createArgs.connectionId,
    };
    const conns: BankConnection[] = await mockController.read(readAccountArgs);
    expect(conns.length).toBe(1);
    const con = conns[0];
    expect(con.connectionId).toEqual(createArgs.connectionId);
    expect(con.bankName).toEqual(createArgs.bankName);
    expect(con.userId).toEqual(createArgs.userId);
  });

  it(`should read by user id`, async () => {
    const createArgs: BankConnection = {
      bankName: 'bank_name',
      userId: 'user_id',
      login: 'login',
      password: 'password',
      connectionId: '2234546',
    };

    await mockController.create(createArgs);

    const readAccountArgs: BankSyncArgs = {
      userId: createArgs.userId,
    };
    const conns: BankConnection[] = await mockController.read(readAccountArgs);
    expect(conns.length).toBe(1);
    const con = conns[0];
    expect(con.connectionId).toEqual(createArgs.connectionId);
    expect(con.bankName).toEqual(createArgs.bankName);
    expect(con.userId).toEqual(createArgs.userId);
  });
});
