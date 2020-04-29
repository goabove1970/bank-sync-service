import logger from '@root/src/logger';
import { bankConnectionController } from '../connections-controller';
import moment = require('moment');
import { GuidFull } from '@root/src/utils/generateGuid';
import { isConnectionActive, isSuspended } from '@root/src/models/bank-connection-status';
import { BankConnection } from '@root/src/models/bank-connection';
import { BankConnectionStats, BankAccountPollStatus } from '@root/src/models/bank-connection-stats';
import { ChaseBankAdaptor } from './adapters/chase';

var cron = require('node-cron');

export class BankSyncScheduler {
  constructor() {
    this.restartScheduler();
    this.executeSync();
  }

  restartScheduler() {
    const cronArgument = '0 * * * *'; // every hour
    cron.schedule(cronArgument, async () => {
      await this.executeSync();
    });
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
      const syncStats: BankConnectionStats = {
        userId: conn.userId,
        syncSessionId: sessionId,
        bankConnectionId: conn.connectionId,
      };

      if (!isConnectionActive(conn.status) || isSuspended(conn.status)) {
        conn.lastPollStats = syncStats;
        conn.lastPollDate = moment().toDate();
        continue;
      }

      switch (conn.bankName) {
        case 'chase':
          const chaseAdapter = new ChaseBankAdaptor(conn.login, conn.password);

          let accounts = [];
          try {
            logger.info(
              `Requesting accounts for connection [${conn.connectionId}], bank [${conn.bankName}]. Session [${sessionId}].`
            );
            const acctData = await chaseAdapter.extractAccounts();
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
              logger.info(
                `Requesting data for account [${conn.connectionId}/${account.accountId}]. Session [${sessionId}].`
              );
              const accountData = await chaseAdapter.getAccountData(account);
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

          break;
        default:
          logger.info(`Can not find bank adapter for bank [${conn.bankName}]. Session [${sessionId}].`);
      }
      conn.lastPollStats = syncStats;
      conn.lastPollDate = moment().toDate();
    }

    logger.info(`Sync session [${sessionId}] completed.`);
    return toBePolled;
  }
}

const scheduler = new BankSyncScheduler();

export default scheduler;
