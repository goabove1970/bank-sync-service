import { ofxCreditTransaction } from './ofx-credit-transaction';
import { ofxDebitTransaction } from './ofx-debit-transaction';

export type ofxTransaction = ofxCreditTransaction & ofxDebitTransaction;
