import { AccountType } from './Account';

export interface AccountCreateArgs {
  userId?: string;
  bankRoutingNumber?: string;
  bankAccountNumber?: string;
  bankName?: string;
  accountType?: AccountType;
  serviceComment?: string;
  alias?: string;
  cardNumber?: string;
}
