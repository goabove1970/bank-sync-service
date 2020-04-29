export enum BankConnectionStatus {
  Active = 1,
  BankActivationRequired = 2,
  CouldNotConnect = 4,
  Suspended = 8,
  Validated = 16,
}

export const isConnectionActive = (t: BankConnectionStatus): boolean => {
  if (!t) {
    return false;
  }
  return (t & BankConnectionStatus.Active) != 0 ? true : false;
};

export const isBankActivationRequired = (t: BankConnectionStatus): boolean => {
  if (!t) {
    return false;
  }
  return (t & BankConnectionStatus.BankActivationRequired) != 0 ? true : false;
};

export const isCouldNotConnect = (t: BankConnectionStatus): boolean => {
  if (!t) {
    return false;
  }
  return (t & BankConnectionStatus.CouldNotConnect) != 0 ? true : false;
};

export const isSuspended = (t: BankConnectionStatus): boolean => {
  if (!t) {
    return false;
  }
  return (t & BankConnectionStatus.Suspended) != 0 ? true : false;
};

export const isValidated = (t: BankConnectionStatus): boolean => {
  if (!t) {
    return false;
  }
  return (t & BankConnectionStatus.Validated) != 0 ? true : false;
};
