import { TransactionImprtResult } from "../controllers/transaction-processor-controller/transaction-import-result";
import { AccountData } from "./account-data";

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
