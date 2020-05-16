import { ChaseTransactionOriginType } from '@models/transaction/chase/ChaseTransactionOriginType';
import { ParseError } from '@models/errors/parse-error';
import { ChaseTransactionType, CreditCardTransactionType } from '@models/transaction/chase/ChaseTransactionType';

export function parseChaseTransDetails(details: string): ChaseTransactionOriginType {
  switch (details) {
    case 'DEBIT':
      return ChaseTransactionOriginType.Debit;
    case 'XFER':
      return ChaseTransactionOriginType.Xfer;
    case 'FEE':
      return ChaseTransactionOriginType.Fee;
    case 'CREDIT':
      return ChaseTransactionOriginType.Credit;
    case 'ATM':
      return ChaseTransactionOriginType.Atm;
    case 'CHECK':
      return ChaseTransactionOriginType.Check;
    case 'DSLIP':
      return ChaseTransactionOriginType.Dslip;
    case 'OTHER':
      return ChaseTransactionOriginType.Other;
    default:
      return ChaseTransactionOriginType.Unknown;
  }
  throw {
    part: 'TransactionOriginType',
    message: `Could not parse ${details} TransactionOriginType`,
  } as ParseError;
}

export function parseCreditCardTransactionType(line: string): CreditCardTransactionType {
  try {
    switch (line) {
      case 'Adjustment':
        return CreditCardTransactionType.Adjustment;
      case 'Fee':
        return CreditCardTransactionType.Fee;
      case 'Payment':
        return CreditCardTransactionType.Payment;
      case 'Return':
        return CreditCardTransactionType.Return;
      case 'Sale':
        return CreditCardTransactionType.Sale;
    }
  } catch (error) {
    throw {
      part: 'CreditCardTransactionType',
      message: `Could not parse ${line} CreditCardTransactionType, ${error.message}`,
    } as ParseError;
  }
  return CreditCardTransactionType.Undefined;
}

export function parseChaseTransactionType(line: string): ChaseTransactionType {
  try {
    switch (line) {
      case 'XFER':
      case 'ACCT_XFER':
        return ChaseTransactionType.AccountTransfer;
      case 'ACH_CREDIT':
        return ChaseTransactionType.AchCredit;
      case 'ACH_DEBIT':
        return ChaseTransactionType.AchDebit;
      case 'ATM':
        return ChaseTransactionType.Atm;
      case 'ATM_DEPOSIT':
        return ChaseTransactionType.AtmDeposit;
      case 'CHASE_TO_PARTNERFI':
        return ChaseTransactionType.ChaseToPartner;
      case 'CHECK_DEPOSIT':
        return ChaseTransactionType.CheckDeposit;
      case 'CHECK_PAID':
        return ChaseTransactionType.CheckPaid;
      case 'DEBIT_CARD':
        return ChaseTransactionType.DebitCard;
      case 'DEPOSIT':
        return ChaseTransactionType.Deposit;
      case 'FEE':
      case 'FEE_TRANSACTION':
        return ChaseTransactionType.FeeTransaction;
      case 'MISC_CREDIT':
        return ChaseTransactionType.MiscCredit;
      case 'MISC_DEBIT':
        return ChaseTransactionType.MiscDebit;
      case 'PARTNERFI_TO_CHASE':
        return ChaseTransactionType.PartnerToChase;
      case 'QUICKPAY_CREDIT':
        return ChaseTransactionType.QuickPayCredit;
      case 'QUICKPAY_DEBIT':
        return ChaseTransactionType.QuickPayDebit;
      case 'WIRE_OUTGOING':
        return ChaseTransactionType.WireOutgoing;
      case 'WIRE_INGOING':
        return ChaseTransactionType.WireIngoing;
    }
  } catch (error) {
    throw {
      part: 'TransactionType',
      message: `Could not parse ${line} TransactionType, ${error.message}`,
    } as ParseError;
  }
  return ChaseTransactionType.Undefined;
}
