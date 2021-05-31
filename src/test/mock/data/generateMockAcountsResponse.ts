import { ofxAccount } from "@root/src/models/ofx-account";
import { ofxResponse } from "@root/src/models/ofx-response";

export const getAccountResponseFrame = (
  accounts?: ofxAccount[]
): ofxResponse => {
  const response: ofxResponse = {
    accounts: accounts && accounts.length > 0 ? accounts : [],
    statusData: {
      severity: "INFO",
      message: "SUCCESS",
    },
  };
  return response;
};

export const getCreditAccountSaphireSample = (): ofxAccount => {
  return getCreditAccount("CREDIT CARD", "4266841594977983", "ACTIVE");
};

export const getCreditAccountFreedomSample = (): ofxAccount => {
  return getCreditAccount("CREDIT CARD", "4147202474828223", "ACTIVE");
};

export const getDebitAccountSample = (): ofxAccount => {
  return getDebitAccount(
    "TOTAL CHECKING",
    "528960656",
    "ACTIVE",
    "071000013",
    "CHECKING"
  );
};

export const getAccountResponseSample = (): ofxResponse => {
  const accounts: ofxAccount[] = [
    getDebitAccountSample(),
    getCreditAccountSaphireSample(),
    getCreditAccountFreedomSample(),
  ];
  return getAccountResponseFrame(accounts);
};

export const getDebitAccount = (
  description: string,
  accountId: string,
  svcstatus: string,
  bankId: string,
  acctype: string
): ofxAccount => {
  return {
    description,
    accountId,
    svcstatus,
    bankId,
    acctype,
  };
};

export const getCreditAccount = (
  description: string,
  accountId: string,
  svcstatus: string
): ofxAccount => {
  return {
    description,
    accountId,
    svcstatus,
  };
};
