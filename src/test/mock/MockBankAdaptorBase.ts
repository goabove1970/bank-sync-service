import "jest";
import { AccountData } from "@root/src/models/account-data";
import { BankAdaptorBase } from "@root/src/models/bank-adaptor-base";
import { ofxAccount } from "@root/src/models/ofx-account";
import { ofxResponse } from "@root/src/models/ofx-response";
import { ofxStatusData } from "@root/src/models/ofx-status-data";
import { ofxTransaction } from "@root/src/models/ofx-transaction";

export class MockableOfxResponse implements ofxResponse {
  accounts?: ofxAccount[];
  statusData?: ofxStatusData;
}

export class MockableAccountData implements AccountData {
  transactions: ofxTransaction[];
  transactionsCount: number;
  accountId: string;
  accountType: string;
  bankId: string;
  description: string;
}

export class MockableBankAdaptorData {
  mockOfxResponse?: ofxResponse;
  acctData?: Map<string, AccountData>;
}
export const mockableBankAdaptorData = new MockableBankAdaptorData();

const MockRemoveOldFiles = jest.fn(
  (): Promise<void> => {
    throw "Not implemented mock method";
    return Promise.resolve();
  }
);

const MockClearOldFileUploads = jest.fn(
  (tmpDir: string, ext: string): Promise<void> => {
    throw "Not implemented mock method";
    return Promise.resolve();
  }
);

const MockCallBank = jest.fn(
  (rqst: string): Promise<string> => {
    throw "Not implemented mock method";
    return Promise.resolve("");
  }
);

const MockExtractAccounts = jest.fn(
  (): Promise<ofxResponse> => {
    return Promise.resolve(mockableBankAdaptorData.mockOfxResponse);
  }
);

const MockGetAccountData = jest.fn(
  (acct: ofxAccount): Promise<AccountData> => {
    return Promise.resolve(mockableBankAdaptorData.acctData[acct.accountId]);
  }
);

const MockGetAccountsData = jest.fn(
  (): Promise<AccountData[]> => {
    throw "Not implemented mock method";
    let acctData: AccountData[] = [];
    return Promise.resolve(acctData);
  }
);

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
  creditPythonScript: "",
}));
