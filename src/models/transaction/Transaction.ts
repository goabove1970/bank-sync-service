import { ChaseTransaction } from './chase/ChaseTransaction';

export interface Transaction {
  accountId?: string;
  transactionId?: string;
  importedDate?: Date;
  categoryId?: string;
  userComment?: string;
  overridePostingDate?: Date;
  overrideDescription?: string;
  serviceType?: TransactionServiceType;
  overrideCategory?: string;
  transactionStatus?: TransactionStatus;
  processingStatus?: ProcessingStatus;
  businessId?: string;
  chaseTransaction?: ChaseTransaction;
}

export enum TransactionServiceType {
  paidCreditCard = 1,
}

export enum TransactionStatus {
  excludeFromBalance = 1,
  recurring = 2,
  hidden = 4,
}

export enum ProcessingStatus {
  unprocessed = 1,
  merchantRecognized = 2,
  merchantUnrecognized = 4,
  merchantOverridenByUser = 8,
  multipleBusinessesMatched = 16,
  polledFromBankConnection,
}
