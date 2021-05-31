import "jest";
import { BankController } from "../../controllers/bank-controller";
import { BankConnection } from "@root/src/models/bank-connection";
import { BankSyncArgs } from "@root/src/routes/connections-request";
import { validateConnectionCreateArgs } from "@root/src/controllers/account-controller/bank-connection/helper";

export const mockableBankConnectiondsArgs: {
  mockBankConnectionsCollection: BankConnection[];
} = {
  mockBankConnectionsCollection: [],
};

const getCollection: () => BankConnection[] = () => {
  return mockableBankConnectiondsArgs.mockBankConnectionsCollection;
};

const updateItem = (item: BankConnection) => {
  const index = getCollection().findIndex(
    (e) => e.connectionId === item.connectionId
  );
  if (index !== -1) {
    getCollection()[index] = item;
  }
};

const deleteItem = (key: string) => {
  const index = getCollection().findIndex((e) => e.connectionId === key);
  if (index > -1) {
    getCollection().splice(index, 1);
  }
};

const MockCreateBankConnection = jest.fn(
  (args: BankConnection): Promise<void> => {
    validateConnectionCreateArgs(args);
    mockableBankConnectiondsArgs.mockBankConnectionsCollection.push(args);
    return Promise.resolve();
  }
);

const MockReadBankConnection = jest.fn(
  (args: BankSyncArgs): Promise<BankConnection[]> => {
    let subset = getCollection();
    if (args.connectionId) {
      subset = subset.filter((d) => d.connectionId === args.connectionId);
    }
    if (args.userId) {
      subset = subset.filter((d) => d.userId === args.userId);
    }
    if (args.login) {
      subset = subset.filter((d) => d.login === args.login);
    }
    return Promise.resolve(subset);
  }
);

const MockUpdateBankConnection = jest.fn(
  (args: BankSyncArgs): Promise<void> => {
    validateConnectionCreateArgs(args);
    updateItem(args);
    return Promise.resolve();
  }
);

const MockDeleteBankConnection = jest.fn(
  (args: BankSyncArgs): Promise<void> => {
    deleteItem(args.connectionId);
    return Promise.resolve();
  }
);

export const MockBankController = jest.fn<BankController, []>(() => ({
  create: MockCreateBankConnection,
  read: MockReadBankConnection,
  update: MockUpdateBankConnection,
  delete: MockDeleteBankConnection,
}));
