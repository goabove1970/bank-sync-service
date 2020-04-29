import { ofxTransaction } from './ofx-transaction';

export interface AccountData {
  transactions: ofxTransaction[];
  transactionsCount: number;
}
