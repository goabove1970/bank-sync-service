import { AccountStatus } from './AccountStatus';

export interface UserAccount {
  accountId?: string;
  userId?: string;
  bankRoutingNumber?: string;
  bankAccountNumber?: string;
  bankName?: string;
  createDate?: Date;
  status?: AccountStatus;
  serviceComment?: string;
  accountType?: AccountType;
  cardNumber?: string;
  cardExpiration?: Date;
  alias?: string;
}

export interface UserAccountLink {
  accountId?: string;
  userId?: string;
}

export enum AccountType {
  Credit = 1,
  Debit = 2,
  Checking = 4,
  Savings = 8,
}
