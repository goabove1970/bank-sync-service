import { AccountStatus } from "./AccountStatus";
import { AccountServiceComment, AccountType } from "./Account";
export interface AccountUpdateArgs {
  accountId?: string;
  userId?: string;
  bankRoutingNumber?: string;
  bankAccountNumber?: string;
  bankName?: string;
  status?: AccountStatus;
  accountType?: AccountType;
  forceUpdate?: boolean;
  cardNumber?: string;
  cardExpiration?: Date;
  alias?: string;
  serviceComment?: AccountServiceComment;
}
