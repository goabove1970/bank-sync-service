import { AccountType } from "@root/src/models/accounts/Account";
import { ofxTransaction } from "@root/src/models/ofx-transaction";
import {
  Transaction,
  ProcessingStatus,
} from "@root/src/models/transaction/Transaction";
import { isCreditAccountType } from "@root/src/utils/accountUtils";
import {
  parseChaseTransDetails,
  parseChaseTransactionType,
  parseCreditCardTransactionType,
} from "@root/src/utils/ChaseParseHelper";
import { GuidFull } from "@root/src/utils/generateGuid";
import moment = require("moment");

export const toCommonTransaciton = (
  tr: ofxTransaction,
  accountId: string,
  accountType: AccountType
): Transaction => {
  return {
    accountId,
    transactionId: GuidFull(),
    importedDate: moment().toDate(),
    categoryId: undefined,
    userComment: tr.name,
    overridePostingDate: undefined,
    overrideDescription: undefined,
    serviceType: undefined,
    overrideCategory: undefined,
    transactionStatus: undefined,
    processingStatus: ProcessingStatus.polledFromBankConnection,
    businessId: undefined,
    chaseTransaction: {
      Details: parseChaseTransDetails(tr.transactionType),
      PostingDate: tr.datePosted,
      Description: tr.name + (tr.memo ? ` ${tr.memo}` : ""),
      Amount: tr.amount,
      Type: isCreditAccountType(accountType)
        ? undefined
        : parseChaseTransactionType(tr.transactionType),
      Balance: undefined,
      CheckOrSlip: tr.memo,
      CreditCardTransactionType: isCreditAccountType(accountType)
        ? parseCreditCardTransactionType(tr.transactionType)
        : undefined,
      BankDefinedCategory: tr.fitid,
    },
  };
};
