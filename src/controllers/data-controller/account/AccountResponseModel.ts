import { UserAccount } from '@models/accounts/Account';

export interface AccountResponseModel extends UserAccount {
  isAccountActive?: boolean;
  isAccountDeactiveted?: boolean;
  isAccountLocked?: boolean;
  isAccountActivationPending?: boolean;
  isSavings?: boolean;
  isDebit?: boolean;
  isCredit?: boolean;
  isCheching?: boolean;
}
