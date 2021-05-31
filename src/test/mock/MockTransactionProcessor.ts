import "jest";
import { Transaction } from "../../../src/models/transaction/Transaction";
import { TransactionProcessor } from "../../../src/controllers/transaction-processor-controller/call-through-transaction-processor";
import { TransactionReadArg } from "../../../src/models/transaction/TransactionReadArgs";
import { TransactionImprtResult } from "../../controllers/transaction-processor-controller/transaction-import-result";

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
    try {
      let res: TransactionImprtResult = {
        parsed: 0,
        duplicates: 0,
        businessRecognized: 0,
        multipleBusinessesMatched: 0,
        newTransactions: 0,
        unposted: 0,
        unrecognized: 0,
      };
      const newTrans = bulk.map((t) => {
        return { ...t, accountId };
      });
      newTrans.forEach((t) => addItem(t));
      res.newTransactions = bulk.length;
      return Promise.resolve(res);
    } catch (error) {
      return Promise.reject(error);
    }
  }
);

const MockReadTransactions = jest.fn(
  (args: TransactionReadArg): Promise<number | Transaction[]> => {
    const collection = getCollection();
    let result: number | Transaction[];
    if (args.countOnly) {
      result = collection.length;
    } else {
      result = collection;
    }
    return Promise.resolve(result);
  }
);

export let MockTransactionProcessor = jest.fn<TransactionProcessor, []>(() => ({
  config: {},
  routerName: "",
  addTransactions: MockAddTransactions,
  readTransactions: MockReadTransactions,
}));
