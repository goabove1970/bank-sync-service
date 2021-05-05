import { Transaction } from "@src/models/transaction/Transaction";

import "jest";
import {
  TransactionImprtResult,
  TransactionProcessor,
} from "@root/src/controllers/transaction-processor-controller/TransactionProcessor";

export const mockableTransactionProcessorArgs: {
  transactions: Transaction[];
} = {
  transactions: [],
};

const getCollection: () => Transaction[] = () => {
  return mockableTransactionProcessorArgs.transactions;
};

const addItem = (item: Transaction) => {
  getCollection().push(item);
};

const MockAddTransactions = jest.fn(
  (bulk: Transaction[], accountId: string): Promise<TransactionImprtResult> => {
    let res: TransactionImprtResult;
    const newTrans = bulk.map((t) => {
      return { ...t, accountId };
    });
    newTrans.forEach((t) => addItem(t));
    return Promise.resolve(res);
  }
);

export let MockTransactionProcessor = jest.fn<TransactionProcessor, []>(() => ({
  config: {},
  routerName: "",
  addTransactions: MockAddTransactions,
  readTransactions: undefined,
}));
