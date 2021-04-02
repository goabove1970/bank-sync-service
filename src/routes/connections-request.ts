import { BankConnection } from '../models/bank-connection';
import { BankConnectionStats } from '../models/bank-connection-stats';

export enum BankSyncRequestType {
  AddBankConnection = 'add-bank-connection',
  RemoveBankConnection = 'remove-bank-connection',
  UpdateBankConnection = 'update-bank-connection',
  GetBankConnections = 'get-bank-connections',
  Synchonize = 'sync',
}

interface BankResponseBase {
  error?: string;
  errorCode?: number;
  payload?: {
    connectionId?: string;
    userId?: string;
    connections?: BankConnection[];
    bankSeverity?: string;
    bankMessage?: string;
    bankCode?: number;
    linkedAccounts?: any;
    syncData?: any;
  };
}

export interface BankSyncRequest {
  action?: BankSyncRequestType;
  args?: BankSyncArgs;
}

export interface BankConnectionResponse extends BankResponseBase {
  action?: BankSyncRequestType;
}

export interface BankSyncArgs {
  connectionId?: string;
  userId?: string;
  bankName?: string;
  login?: string;
  password?: string;
  status?: number;
  lastPollDate?: Date;
  lastPollStats?: BankConnectionStats;
  suspend?: boolean;
}
