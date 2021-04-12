import { BankPollController } from "@root/src/controllers/bank-controller";
import { BankSyncScheduler } from "@root/src/controllers/bank-controller/scheduler";
import { BankConnection } from "@root/src/models/bank-connection";

const MockRestartScheduler = jest.fn((): void => {
  throw "Not implemented";
});

const MockExecuteSync = jest.fn((userId?: string, connectionId?: string, force?: boolean): Promise<BankConnection[]> => {
  throw "Not implemented";
});

export const MockBankSyncScheduler: (pc: BankPollController) =>
  BankSyncScheduler = jest.fn<BankSyncScheduler, [BankPollController]>((bankPollController) => ({
    bankPollController,
    restartScheduler: MockRestartScheduler,
    executeSync: MockExecuteSync,
  }));
