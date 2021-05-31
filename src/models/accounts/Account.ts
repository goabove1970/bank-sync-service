import { AccountStatus } from "./AccountStatus";

export interface UserAccount {
  accountId?: string;
  userId?: string;
  bankRoutingNumber?: string;
  bankAccountNumber?: string;
  bankName?: string;
  createDate?: Date;
  status?: AccountStatus;
  serviceComment?: AccountServiceComment;
  accountType?: AccountType;
  cardNumber?: string;
  cardExpiration?: Date;
  alias?: string;
}

export interface AccountServiceComment {
  replacedByAccount?: string;
  replacesAccount?: string;
  serviceMessage?: string;
  closeDate?: Date;
}

export enum AccountType {
  Credit = 1,
  Debit = 2,
  Checking = 4,
  Savings = 8,
}
