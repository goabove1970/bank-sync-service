import { Transaction } from "@root/src/models/transaction/Transaction";

export class AccountCacheRecord {
  lastCacheTime: Date;
  transactions: Transaction[];
}
