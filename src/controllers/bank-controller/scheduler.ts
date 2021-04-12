import { BankConnection } from '@root/src/models/bank-connection';
import pollController, { BankPollController } from '.';

export class BankSyncScheduler {
  bankPollController: BankPollController;
  constructor(pollController: BankPollController) {
    this.bankPollController = pollController;
    this.restartScheduler();
    this.executeSync();
  }

  restartScheduler(): void {
    setInterval(async () => {
      await this.executeSync();
    }, 1000 * 60 * 60);
  }

  async executeSync(userId?: string, connectionId?: string, force?: boolean): Promise<BankConnection[]> {
    return this.bankPollController.executeSync(userId, connectionId, force);
  }
}

const scheduler = new BankSyncScheduler(pollController);

export default scheduler;
