import { ofxTransaction } from "@root/src/models/ofx-transaction";
import { Transaction } from "@root/src/models/transaction/Transaction";
import moment = require("moment");

export const findMatchingOfxTransaction = (
  trs: ofxTransaction[],
  tr: Transaction
) => {
  const matching = trs.find((oftr: ofxTransaction) => {
    return transactionsMatch(tr, oftr);
  });
  return matching;
};

export const transactionsMatch = (
  transaction: Transaction,
  ofxTrans: ofxTransaction
) => {
  return (
    ofxTrans.name === transaction.chaseTransaction.Description &&
    ofxTrans.amount === transaction.chaseTransaction.Amount &&
    moment(ofxTrans.datePosted)
      .startOf("day")
      .isSame(
        moment(transaction.chaseTransaction.PostingDate).startOf("day")
      ) &&
    ofxTrans.fitid === transaction.chaseTransaction.BankDefinedCategory
  );
};

export const transactionsMatchOfx = (
  t1: ofxTransaction,
  t2: ofxTransaction
) => {
  return (
    t1.name === t1.name &&
    t1.amount === t2.amount &&
    moment(t1.datePosted)
      .startOf("day")
      .isSame(moment(t2.datePosted).startOf("day")) &&
    t1.fitid === t2.fitid
  );
};
