import { Transaction } from '@src/models/transaction/Transaction';

export interface TransactionImprtResult {
  parsed: number;
  duplicates: number;
  newTransactions: number;
  businessRecognized: number;
  multipleBusinessesMatched: number;
  unrecognized: number;
  unposted: number;
}

export class TransactionProcessor {

  async addTransactions(bulk: Transaction[], accountId: string): Promise<TransactionImprtResult> {
    throw "Not implemented, add passthrough logic"
  }

}

export const transactionProcessor = new TransactionProcessor();
