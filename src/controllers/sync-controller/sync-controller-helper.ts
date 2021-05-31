import { ofxTransaction } from "@root/src/models/ofx-transaction";
import { Transaction } from "@root/src/models/transaction/Transaction";
import moment = require("moment");
import { AccountTransactionsCache } from "./model/account-cache/account-cache";
import { findMatchingOfxTransaction } from "./utils/findMatchingOfxTransaction";

export const getOldestTransactionDate = (transactions: ofxTransaction[]) => {
  return transactions.reduce((previous, current) => {
    const prevDate = moment(previous).startOf("day");
    const currentDate = moment(current.datePosted).startOf("day");

    if (currentDate.isBefore(prevDate)) {
      return currentDate;
    }
    return prevDate;
  }, moment());
};

export const ofxTransactionsHaveLastDbTransactions = async (
  accountId: string,
  ofxTransactions: ofxTransaction[],
  cache: AccountTransactionsCache,
  transactionsNeededToMatchAccounts: number
): Promise<boolean> => {
  const accountCache = await cache.getAccountCache(
    accountId,
    transactionsNeededToMatchAccounts
  );
  // last 20 (10,15...) transactions from db account
  const dbTransactions: Transaction[] = accountCache.transactions;
  const allTrnsactionsPresent =
    dbTransactions.length >= transactionsNeededToMatchAccounts &&
    dbTransactions.every((f: Transaction) => {
      const matchingOfxTransaction = findMatchingOfxTransaction(
        ofxTransactions,
        f
      );
      return matchingOfxTransaction !== undefined;
    });
  if (allTrnsactionsPresent) {
    return true;
  }
  return false;
};
