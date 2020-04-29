import { BankConnection } from '../models/bank-connection';
import { BankConnectionStats } from '../models/bank-connection-stats';

export enum BankSyncRequestType {
  AddBankConnection = 'add-bank-connection',
  RemoveBankConnection = 'remove-bank-connection',
  UpdateBankConnection = 'update-bank-connection',
  GetBankConnections = 'get-bank-connections',
}

export interface ResponseBase {
  error?: string;
  errorCode?: number;
  payload?: {
    connectionId?: string;
    userId?: string;
    connections?: BankConnection[];
  };
}

export interface BankSyncRequest {
  action?: BankSyncRequestType;
  args?: BankSyncArgs;
}

export interface BankConnectionResponse extends ResponseBase {
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
