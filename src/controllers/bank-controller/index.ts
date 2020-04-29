import { ofxResponse } from '@root/src/models/ofx-response';
import { BankConnection } from '@root/src/models/bank-connection';
import logger from '@root/src/logger';
import { BankAdaptorBase } from '@root/src/models/bank-adaptor-base';
import { ChaseBankAdaptor } from './adapters/chase';
import { BankConnectionStats, BankAccountPollStatus } from '@root/src/models/bank-connection-stats';
import {
  isConnectionActive,
  isSuspended,
  isCouldNotConnect,
  isValidated,
} from '@root/src/models/bank-connection-status';
import moment = require('moment');
import { GuidFull } from '@root/src/utils/generateGuid';
import { bankConnectionController } from '../connections-controller';

export class BankPollController {
  constructor() {}

  async syncConnection(conn: BankConnection, sessionId: string): Promise<BankConnectionStats> {
    const syncStats: BankConnectionStats = {
      userId: conn.userId,
      syncSessionId: sessionId,
      bankConnectionId: conn.connectionId,
    };

    if (
      !isConnectionActive(conn.status) ||
      isSuspended(conn.status) ||
      isCouldNotConnect(conn.status) ||
      !isValidated(conn.status)
    ) {
      conn.lastPollStats = syncStats;
      conn.lastPollDate = moment().toDate();
      return syncStats;
    }

    const bankAdapter = this.getBankAdapter(conn);

    // poll bank acctounts for this bank connection
    let accounts = [];
    try {
      logger.info(
        `Requesting accounts for connection [${conn.connectionId}], bank [${conn.bankName}]. Session [${sessionId}].`
      );
      const acctData = await bankAdapter.extractAccounts();
      if (acctData.statusData) {
        logger.info(
          `Received [${acctData.statusData.severity}] for connection [${conn.connectionId}], bank [${conn.bankName}]. Session [${sessionId}].`
        );

        if (acctData.statusData.severity === 'ERROR') {
          syncStats.bankConnectionError = acctData.statusData.message;
          syncStats.bankConnectionErrorCode = acctData.statusData.code;
        } else {
          accounts = acctData.accounts;
        }
      }
    } catch (e) {
      logger.error(`Error polling accounts for connection [${conn.connectionId}]: ${e.message || e}`);
      syncStats.bankConnectionError = e.message || e;
    }

    // iterate through accounts
    syncStats.accounts = [];
    for (let acctIter = 0; acctIter < accounts.length; acctIter++) {
      const account = accounts[acctIter];
      const acctStats: BankAccountPollStatus = {
        accountNumber: account.accountId,
        syncStarted: moment().toDate(),
      };
      syncStats.accounts.push(acctStats);
      try {
        logger.info(`Requesting data for account [${conn.connectionId}/${account.accountId}]. Session [${sessionId}].`);
        const accountData = await bankAdapter.getAccountData(account);
        logger.info(
          `Recevied ${accountData.transactions.length} for account [${conn.connectionId}/${account.accountId}]. Session [${sessionId}].`
        );
        acctStats.accountData = accountData;
        acctStats.recordsPolled = accountData.transactions.length;
        acctStats.syncCompleted = moment().toDate();
      } catch (e) {
        logger.error(
          `Error polling data for account [${conn.connectionId}/${account.accountId}]. Session [${sessionId}].`
        );
        acctStats.bankConnectionError = e.message || e;
      }
    }
    return syncStats;
  }

  async getConnectionStatus(conn: BankConnection): Promise<ofxResponse> {
    let response: ofxResponse = {};
    const bankAdapter = this.getBankAdapter(conn);
    try {
      logger.info(`Validating connection [${conn.connectionId}], bank [${conn.bankName}].`);
      response = await bankAdapter.extractAccounts();
      if (response.statusData) {
        logger.info(
          `Received [${response.statusData.severity}] for connection [${conn.connectionId}], bank [${conn.bankName}].`
        );
      }
    } catch (e) {
      logger.error(`Error validating connection [${conn.connectionId}]: ${e.message || e}`);
    }
    return response;
  }

  async isConnectionValid(conn: BankConnection): Promise<boolean> {
    const status = await this.getConnectionStatus(conn);
    return status && status.statusData && status.statusData.severity !== 'ERROR';
  }

  async executeSync(): Promise<BankConnection[]> {
    const sessionId = GuidFull();

    logger.info(`Starting hourly sync session [${sessionId}]`);
    const connections = await bankConnectionController.read({});
    logger.info(`Extracted ${connections.length} connections. Session [${sessionId}].`);
    const toBePolled = connections.filter(
      (c) => !c.lastPollDate || (c.lastPollDate && moment(c.lastPollDate).isBefore(moment().subtract(1, 'hour')))
    );
    logger.info(`Scheduling ${toBePolled.length} connections for polling. Session [${sessionId}].`);

    for (let connIter = 0; connIter < toBePolled.length; connIter++) {
      const conn = toBePolled[connIter];
      const connStatus = await pollController.syncConnection(conn, sessionId);
      conn.lastPollStats = connStatus;
      conn.lastPollDate = moment().toDate();
    }

    logger.info(`Sync session [${sessionId}] completed.`);
    return toBePolled;
  }

  getBankAdapter(conn: BankConnection): BankAdaptorBase {
    // find bank adapter
    let bankAdapter: BankAdaptorBase = undefined;
    switch (conn.bankName) {
      case 'chase':
        bankAdapter = new ChaseBankAdaptor(conn.login, conn.password);

        break;
      default:
        logger.error(`Can not find bank adapter for bank [${conn.bankName}].`);
    }

    return bankAdapter;
  }
}

const pollController = new BankPollController();
export default pollController;
