import "jest";
import { SyncScheduler } from "@root/src/controllers/scheduler";
import { SyncController } from "@root/src/controllers/sync-controller/sync-controller";

const MockRestartScheduler = jest.fn((): void => {
  throw "Not implemented";
});

export const MockBankSyncScheduler: (
  syncController: SyncController
) => SyncScheduler = jest.fn<SyncScheduler, [SyncController]>(
  (bankPollController) => ({
    syncController: bankPollController,
    restartScheduler: MockRestartScheduler,
  })
);
