import logger from "@root/src/logger";
import { Transaction } from "@root/src/models/transaction/Transaction";
import {
  SortOrder,
  TransactionReadArg,
} from "@root/src/models/transaction/TransactionReadArgs";
import moment = require("moment");
import { TransactionProcessor } from "../../../transaction-processor-controller/call-through-transaction-processor";
import { AccountCacheRecord } from "./account-cache-record";

export class AccountTransactionsCache {
  transactionProcessor: TransactionProcessor;
  constructor(transactionProcessor: TransactionProcessor) {
    this.transactionProcessor = transactionProcessor;
  }

  accountTransactionCache: Map<string, AccountCacheRecord> = new Map<
    string,
    AccountCacheRecord
  >();

  cacheHasExpired(cacheTime: Date) {
    const expiresInHours = 10;
    const expirationTimestamp = moment(cacheTime).add(expiresInHours, "hour");
    const valid = moment().isBefore(expirationTimestamp);
    return !valid;
  }

  async getAccountCache(
    accountId: string,
    transactionsNeededToMatchAccounts: number
  ): Promise<AccountCacheRecord> {
    let accountCache: {
      lastCacheTime: Date;
      transactions: Transaction[];
    } = this.accountTransactionCache[accountId];
    if (
      !accountCache ||
      !accountCache.lastCacheTime ||
      this.cacheHasExpired(accountCache.lastCacheTime)
    ) {
      logger.info(`Updating cache for account ${accountId}`);
      const transactionReadArgs: TransactionReadArg = {
        accountId: accountId,
        readCount: transactionsNeededToMatchAccounts,
        order: SortOrder.descending,
      };
      logger.info(
        `Reading last ${transactionsNeededToMatchAccounts} transactiond for account ${accountId}`
      );
      const accountTransactions = (await this.transactionProcessor.readTransactions(
        transactionReadArgs
      )) as Transaction[];
      accountCache = {
        transactions: accountTransactions,
        lastCacheTime: moment().toDate(),
      };
      this.accountTransactionCache[accountId] = accountCache;
    }
    return accountCache;
  }
}
