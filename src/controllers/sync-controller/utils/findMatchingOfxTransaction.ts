import { ofxTransaction } from "@root/src/models/ofx-transaction";
import { Transaction } from "@root/src/models/transaction/Transaction";

export const findMatchingOfxTransaction = (
  trs: ofxTransaction[],
  tr: Transaction
) => {
  const matching = trs.find((oftr: ofxTransaction) => {
    return (
      oftr.amount === tr.chaseTransaction.Amount &&
      oftr.datePosted === tr.chaseTransaction.PostingDate &&
      oftr.fitid === tr.chaseTransaction.BankDefinedCategory
    );
    return matching;
  });
};
