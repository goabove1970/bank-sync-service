import syncController, { SyncController } from '../sync-controller';

export class SyncScheduler {
  syncController: SyncController;
  constructor(pollController: SyncController) {
    this.syncController = pollController;
    this.restartScheduler();
  }

  restartScheduler(): void {
    setInterval(async () => {
      await this.syncController.executeSync();
    }, 1000 * 60 * 60);
  }
}

const scheduler = new SyncScheduler(syncController);

export default scheduler;
