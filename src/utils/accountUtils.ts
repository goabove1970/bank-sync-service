import { UserAccount, AccountType } from '../models/accounts/Account';
import { AccountStatus } from '../models/accounts/AccountStatus';

export const isAccountActivationPending = (t: UserAccount): boolean => {
  if (!t) {
    return false;
  }
  return (t.status & AccountStatus.ActivationPending) != 0 ? true : false;
};

export const isAccountActive = (t: UserAccount): boolean => {
  if (!t) {
    return false;
  }
  return (t.status & AccountStatus.Active) != 0 ? true : false;
};

export const isAccountDeactiveted = (t: UserAccount): boolean => {
  if (!t) {
    return false;
  }
  return (t.status & AccountStatus.Deactivated) != 0 ? true : false;
};

export const isAccountLocked = (t: UserAccount): boolean => {
  if (!t) {
    return false;
  }
  return (t.status & AccountStatus.Locked) != 0 ? true : false;
};

export const isDebit = (t: UserAccount): boolean => {
  if (!t) {
    return false;
  }
  return (t.accountType & AccountType.Debit) != 0 ? true : false;
};

export const isDebitAccountType = (t: AccountType): boolean => {
  if (!t) {
    return false;
  }
  return (t & AccountType.Debit) != 0 ? true : false;
};

export const isSavings = (t: UserAccount): boolean => {
  if (!t) {
    return false;
  }
  return (t.accountType & AccountType.Savings) != 0 ? true : false;
};

export const isCredit = (t: UserAccount): boolean => {
  if (!t) {
    return false;
  }
  return (t.accountType & AccountType.Credit) != 0 ? true : false;
};

export const isCreditAccountType = (t: AccountType): boolean => {
  if (!t) {
    return false;
  }
  return (t & AccountType.Credit) != 0 ? true : false;
};

export const isCheching = (t: UserAccount): boolean => {
  if (!t) {
    return false;
  }
  return (t.accountType & AccountType.Checking) != 0 ? true : false;
};
