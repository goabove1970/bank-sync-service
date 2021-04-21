import { ofxAccount } from './ofx-account';
import { AccountData } from './account-data';
import { ofxResponse } from './ofx-response';

export interface BankAdaptor {
  extractAccounts(): Promise<ofxResponse>;
  getAccountData(acct: ofxAccount): Promise<AccountData>;
}
