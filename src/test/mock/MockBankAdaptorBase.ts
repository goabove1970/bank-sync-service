import { AccountData } from '@root/src/models/account-data';
import { BankAdaptorBase } from '@root/src/models/bank-adaptor-base';
import { ofxAccount } from '@root/src/models/ofx-account';
import { ofxResponse } from '@root/src/models/ofx-response';


const MockRemoveOldFiles = jest.fn((): Promise<void> => {
  throw "Not implemented mock method"
  return Promise.resolve();
});

const MockClearOldFileUploads = jest.fn((tmpDir: string, ext: string): Promise<void> => {
  throw "Not implemented mock method"
  return Promise.resolve();
});

const MockCallBank = jest.fn((rqst: string): Promise<string> => {
  throw "Not implemented mock method"
  return Promise.resolve("");
});

const MockExtractAccounts = jest.fn((): Promise<ofxResponse> => {
  throw "Not implemented mock method"
  let resp: ofxResponse;
  return Promise.resolve(resp);
});

const MockGetAccountData = jest.fn((acct: ofxAccount): Promise<AccountData> => {
  throw "Not implemented mock method"
  let acctData: AccountData;
  return Promise.resolve(acctData);
});

const MockGetAccountsData = jest.fn((): Promise<AccountData[]> => {
  throw "Not implemented mock method"
  let acctData: AccountData[] = [];
  return Promise.resolve(acctData);
});

export const MockBankAdaptorBase = jest.fn<BankAdaptorBase, []>(() => ({
  removeOldFiles: MockRemoveOldFiles,
  clearOldFileUploads: MockClearOldFileUploads,
  callBank: MockCallBank,
  extractAccounts: MockExtractAccounts,
  getAccountData: MockGetAccountData,
  getAccountsData: MockGetAccountsData,

  login: "",
  bankName: "",
  password: "",
  debitPythonScript: "",
  accountPythonScript: "",
  creditPythonScript: ""

}));
