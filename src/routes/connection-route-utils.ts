import { BankConnection } from "../models/bank-connection";
import { isBankActivationRequired, isConnectionActive, isCouldNotConnect, isSuspended, isValidated } from "../models/bank-connection-status";

export const toResponseBankConnection = (c: BankConnection): any => {
    return {
        ...c,
        isConnectionActive: isConnectionActive(c.status),
        isBankActivationRequired: isBankActivationRequired(c.status),
        isCouldNotConnect: isCouldNotConnect(c.status),
        isSuspended: isSuspended(c.status),
        isValidated: isValidated(c.status),
    };
};