import { BankConnection } from '@root/src/models/bank-connection';
import pollController from '.';

export class BankSyncScheduler {
  constructor() {
    this.restartScheduler();
    this.executeSync();
  }

  restartScheduler() {
    setInterval(async () => {
      await this.executeSync();
    }, 1000 * 60 * 60);
  }

  async executeSync(userId?: string, connectionId?: string, force?: boolean): Promise<BankConnection[]> {
    return pollController.executeSync(userId, connectionId, force);
  }
}

const scheduler = new BankSyncScheduler();

export default scheduler;
