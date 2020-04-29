import { BankConnectionStats } from './bank-connection-stats';
import { BankConnectionStatus } from './bank-connection-status';

export interface BankConnection {
  connectionId?: string;
  userId?: string;
  bankName?: string;
  login?: string;
  password?: string;
  dateAdded?: Date;
  status?: BankConnectionStatus;
  lastPollDate?: Date;
  lastPollStats?: BankConnectionStats;
}
