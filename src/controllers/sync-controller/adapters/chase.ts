import { BankAdaptorBase } from '@root/src/models/bank-adaptor-base';

export class ChaseBankAdaptor extends BankAdaptorBase {
  constructor(login: string, password: string) {
    super(login, password);
    this.bankName = 'chase';
  }

  accountPythonScript = './chase-acct.py';
  creditPythonScript = './chase-credit.py';
  debitPythonScript = './chase-debit.py';
}
