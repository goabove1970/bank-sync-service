import { BankConnection } from '@root/src/models/bank-connection';
import pollController from '.';

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
    return pollController.executeSync();
  }
}

const scheduler = new BankSyncScheduler();

export default scheduler;
