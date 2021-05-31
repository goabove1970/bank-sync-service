import { ofxTransaction } from "./ofx-transaction";

export interface AccountData {
  transactions: ofxTransaction[];
  transactionsCount: number;
  description?: string;
  bankId?: string;
  accountType?: string;
  accountId?: string;
}
