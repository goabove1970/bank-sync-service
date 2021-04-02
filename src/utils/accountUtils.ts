import { AccountType } from '../models/accounts/Account';

export const isCreditAccountType = (t: AccountType): boolean => {
  if (!t) {
    return false;
  }
  return (t & AccountType.Credit) != 0 ? true : false;
};