import { SyncController } from '@root/src/controllers/sync-controller';
import { SyncScheduler } from '@root/src/controllers/scheduler';

const MockRestartScheduler = jest.fn((): void => {
  throw 'Not implemented';
});

export const MockBankSyncScheduler: (
  pc: SyncController
) => SyncScheduler = jest.fn<SyncScheduler, [SyncController]>(
  (bankPollController) => ({
    syncController: bankPollController,
    restartScheduler: MockRestartScheduler,
  })
);
