import { AccountData } from './account-data';
import { TransactionImprtResult } from '../controllers/transaction-processor-controller/TransactionProcessor';

export interface BankAccountPollStatus {
  accountNumber?: string;
  syncStarted?: Date;
  syncCompleted?: Date;
  recordsPolled?: number;
  bankConnectionError?: string;
  bankConnectionErrorCode?: number;
  accountData?: AccountData;
  syncData?: TransactionImprtResult;
}

export interface BankConnectionStats {
  syncSessionId?: string;
  bankConnectionId?: string;
  userId?: string;
  accounts?: BankAccountPollStatus[];
  bankConnectionError?: string;
  bankConnectionErrorCode?: number;
}
