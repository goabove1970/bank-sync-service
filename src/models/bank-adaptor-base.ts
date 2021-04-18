import { BankAdaptor } from './bank-adaptor';
import { ofxAccount } from './ofx-account';
import { AccountData } from './account-data';
import { ofxTransaction } from './ofx-transaction';
import moment = require('moment');
import { ofxResponse } from './ofx-response';
import { ofxStatusData } from './ofx-status-data';
import { acctRqst, ccStatsRqst, bankStatsRqst } from './request-builder';
const fs = require('fs');
var path = require('path');
import * as https from 'https';
import logger from '../logger';

export class BankAdaptorBase implements BankAdaptor {
  login: string;
  password: string;
  bankName: string;
  accountPythonScript: string;
  creditPythonScript: string;
  debitPythonScript: string;

  constructor(login: string, password: string) {
    this.login = login;
    this.password = password;
  }

  static async removeOldFiles(): Promise<void> {
    await this.clearOldFileUploads('./tmp/fileUploads', '.tmp');
    await this.clearOldFileUploads('.', '.ofx');
    return Promise.resolve();
  }

  static async clearOldFileUploads(tmpDir: string, ext: string): Promise<void> {
    if (!fs.existsSync(tmpDir)) {
      return;
    }

    const files = fs.readdirSync(tmpDir);
    const filtered = [];
    const promises = [];
    for (let i = 0; i < files.length; ++i) {
      promises.push(
        new Promise((resolve, reject) => {
          fs.stat(path.join(tmpDir, files[i]), (error, stats) => {
            if (error) {
              reject(error);
            } else {
              if (
                files[i].indexOf(ext) !== -1 &&
                moment(stats.mtimeMs).isBefore(moment().subtract(1, 'hours'))
              ) {
                filtered.push(files[i]);
              }
              resolve(() => {});
            }
          });
        })
      );
    }
    await Promise.all(promises);

    for (let i = 0; i < filtered.length; ++i) {
      const filename = path.join(tmpDir, filtered[i]);
      if (fs.existsSync(filename)) {
        try {
          fs.unlinkSync(filename);
        } catch (error) {
          logger.error(error.message || error);
        }
      }
    }
    return Promise.resolve();
  }

  callBank(rqst: string): Promise<string> {
    const httpOptions = {
      method: 'POST',
      hostname: 'ofx.chase.com',
      headers: {
        'Content-type': 'application/x-ofx',
        'content-length': Buffer.byteLength(rqst),
      },
    };

    let res = new Promise<string>((resolve, reject) => {
      const req = https.request(httpOptions, (res) => {
        let buffer: Buffer;
        res.on('data', (chunk: Buffer) => {
          if (!buffer) {
            buffer = chunk;
          } else {
            buffer = Buffer.concat([buffer, chunk]);
          }
        });

        res.on('end', () => {
          const results = buffer.toString();
          resolve(results);
        });
      });

      req.on('error', (err) => {
        console.error(`Error: ${err.message || err}`);
        reject(err);
      });

      req.write(rqst);
      req.end();
    });
    return res;
  }

  extractAccounts(): Promise<ofxResponse> {
    let res: Promise<ofxResponse> = new Promise((resolve, reject) => {
      const ofxData: ofxResponse = {};
      const rqst = acctRqst(this.login, this.password);
      return this.callBank(rqst).then((results: string) => {
        const accts: ofxAccount[] = [];
        var re = /<ACCTINFO>.*?<\/ACCTINFO>/gm;
        var acctData;
        do {
          acctData = re.exec(results);
          if (acctData && acctData.length) {
            acctData.forEach((acctString) => {
              const data: ofxAccount = parseAcctData(acctString);
              accts.push(data);
            });
          }
        } while (acctData);
        ofxData.accounts = accts;

        // extracting status data
        var statusRegex = /<STATUS>.*?<\/STATUS>/gm;
        var statsMatch = statusRegex.exec(results);

        if (statsMatch && statsMatch.length === 1) {
          ofxData.statusData = parseStatusData(statsMatch[0]);
        }

        resolve(ofxData);
      });
    });

    return res;
  }

  async getAccountData(acct: ofxAccount): Promise<AccountData> {
    return new Promise((resolve, reject) => {
      const acctData: AccountData = {
        transactions: [],
        transactionsCount: 0,
      };
      const rqst =
        acct.acctype === 'CHECKING'
          ? bankStatsRqst(this.login, this.password, acct.accountId, 12)
          : ccStatsRqst(this.login, this.password, acct.accountId, 12);
      this.callBank(rqst)
        .then((results: string) => {
          var re = /<STMTTRN>.*?<\/STMTTRN>/gm;
          var trnsMatch;
          do {
            trnsMatch = re.exec(results);
            if (trnsMatch && trnsMatch.length) {
              trnsMatch.forEach((acctString) => {
                if (acct.acctype === 'CHECKING') {
                  const data = extractDebitTransData(acctString);
                  acctData.transactions.push(data);
                } else {
                  const data = extractCreditTransData(acctString);
                  acctData.transactions.push(data);
                }
              });
              acctData.transactionsCount = acctData.transactions.length;
            }
          } while (trnsMatch);
          resolve(acctData);
        })
        .catch((err) => reject(err));
    });
  }

  async getAccountsData(): Promise<AccountData[]> {
    const res: AccountData[] = [];
    const accts = await this.extractAccounts();
    if (accts.accounts) {
      for (let i = 0; i < accts.accounts.length; i++) {
        const acctData = await this.getAccountData(accts[i]);
        res.push(acctData);
      }
    }
    return res;
  }
}

const parseAcctData = (str: string): ofxAccount => {
  const acct: ofxAccount = {};
  const description = /<DESC>.*?</gm.exec(str);
  if (description && description.length && description[0].length > 6) {
    let des = description[0].substr(6);
    des = des.substring(0, des.length - 1);
    acct.description = des;
  }
  const accountId = /<ACCTID>.*?</gm.exec(str);
  if (accountId && accountId.length && accountId[0].length > 6) {
    let acc = accountId[0].substr(8);
    acc = acc.substring(0, acc.length - 1);
    acct.accountId = acc;
  }
  const scvStatusMatch = /<SVCSTATUS>.*?</gm.exec(str);
  if (scvStatusMatch && scvStatusMatch.length && scvStatusMatch[0].length > 6) {
    let match = scvStatusMatch[0].substr(11);
    match = match.substring(0, match.length - 1);
    acct.svcstatus = match;
  }
  const bankIdMatch = /<BANKID>.*?</gm.exec(str);
  if (bankIdMatch && bankIdMatch.length && bankIdMatch[0].length > 6) {
    let match = bankIdMatch[0].substr(8);
    match = match.substring(0, match.length - 1);
    acct.bankId = match;
  }
  const actTypeMatch = /<ACCTTYPE>.*?</gm.exec(str);
  if (actTypeMatch && actTypeMatch.length && actTypeMatch[0].length > 6) {
    let match = actTypeMatch[0].substr(10);
    match = match.substring(0, match.length - 1);
    acct.acctype = match;
  }
  const acctIdMatch = /<ACCTID>.*?</gm.exec(str);
  if (acctIdMatch && acctIdMatch.length && acctIdMatch[0].length > 6) {
    let match = acctIdMatch[0].substr(8);
    match = match.substring(0, match.length - 1);
    acct.accountId = match;
  }
  return acct;
};

const extractCreditTransData = (str: string): ofxTransaction => {
  const acct: ofxTransaction = {};
  const trnType = /<TRNTYPE>.*?</gm.exec(str);
  if (trnType && trnType.length && trnType[0].length > 6) {
    let match = trnType[0].substr(9);
    match = match.substring(0, match.length - 1);
    acct.transactionType = match;
  }
  const datePosted = /<DTPOSTED>.*?</gm.exec(str);
  if (datePosted && datePosted.length && datePosted[0].length > 6) {
    let match = datePosted[0].substr(10);
    match = match.substring(0, match.length - 1);
    acct.datePosted = moment(match, 'YYYYMMDDhhmmss[hA]').toDate();
  }
  const amount = /<TRNAMT>.*?</gm.exec(str);
  if (amount && amount.length && amount[0].length > 6) {
    let match = amount[0].substr(8);
    match = match.substring(0, match.length - 1);
    acct.amount = parseFloat(match);
  }
  const fitid = /<FITID>.*?</gm.exec(str);
  if (fitid && fitid.length && fitid[0].length > 6) {
    let match = fitid[0].substr(7);
    match = match.substring(0, match.length - 1);
    acct.fitid = match;
  }
  const name = /<NAME>.*?</gm.exec(str);
  if (name && name.length && name[0].length > 6) {
    let match = name[0].substr(6);
    match = match.substring(0, match.length - 1);
    acct.name = match;
  }

  return acct;
};

const extractDebitTransData = (str: string): ofxTransaction => {
  const acct: ofxTransaction = {};
  const trnType = /<TRNTYPE>.*?</gm.exec(str);
  if (trnType && trnType.length && trnType[0].length > 6) {
    let match = trnType[0].substr(9);
    match = match.substring(0, match.length - 1);
    acct.transactionType = match;
  }
  const datePosted = /<DTPOSTED>.*?</gm.exec(str);
  if (datePosted && datePosted.length && datePosted[0].length > 6) {
    let match = datePosted[0].substr(10);
    match = match.substring(0, match.length - 1);
    acct.datePosted = moment(match, 'YYYYMMDDhhmmss[hA]').toDate();
  }
  const amount = /<TRNAMT>.*?</gm.exec(str);
  if (amount && amount.length && amount[0].length > 6) {
    let match = amount[0].substr(8);
    match = match.substring(0, match.length - 1);
    acct.amount = parseFloat(match);
  }
  const fitid = /<FITID>.*?</gm.exec(str);
  if (fitid && fitid.length && fitid[0].length > 6) {
    let match = fitid[0].substr(7);
    match = match.substring(0, match.length - 1);
    acct.fitid = match;
  }
  const name = /<NAME>.*?</gm.exec(str);
  if (name && name.length && name[0].length > 6) {
    let match = name[0].substr(6);
    match = match.substring(0, match.length - 1);
    acct.name = match;
  }
  const memo = /<MEMO>.*?</gm.exec(str);
  if (memo && memo.length && memo[0].length > 6) {
    let match = memo[0].substr(6);
    match = match.substring(0, match.length - 1);
    acct.memo = match;
  }

  return acct;
};

const parseStatusData = (str: string): ofxStatusData => {
  const statusData: ofxStatusData = {};
  const codeMatch = /<CODE>.*?</gm.exec(str);
  if (codeMatch && codeMatch.length && codeMatch[0].length > 6) {
    let match = codeMatch[0].substr(6);
    match = match.substring(0, match.length - 1);
    if (match && parseInt(match)) {
      statusData.code = parseInt(match);
    }
  }
  const severityMatch = /<SEVERITY>.*?</gm.exec(str);
  if (severityMatch && severityMatch.length && severityMatch[0].length > 6) {
    let match = severityMatch[0].substr(10);
    match = match.substring(0, match.length - 1);
    statusData.severity = match;
  }
  const messageMatch = /<MESSAGE>.*?</gm.exec(str);
  if (messageMatch && messageMatch.length && messageMatch[0].length > 6) {
    let match = messageMatch[0].substr(9);
    match = match.substring(0, match.length - 1);
    statusData.message = match;
  }

  return statusData;
};
