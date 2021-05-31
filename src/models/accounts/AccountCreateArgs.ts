import { AccountServiceComment, AccountType } from "./Account";

export interface AccountCreateArgs {
  userId?: string;
  bankRoutingNumber?: string;
  bankAccountNumber?: string;
  bankName?: string;
  accountType?: AccountType;
  serviceComment?: AccountServiceComment;
  alias?: string;
  cardNumber?: string;
}
