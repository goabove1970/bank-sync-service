import accountController from "../account-controller";
import { bankController } from "../bank-controller";
import { transactionProcessor } from "../transaction-processor-controller";
import accountCache from "./model/account-cache";
import { SyncController } from "./sync-controller";

const syncController = new SyncController(
  transactionProcessor,
  accountController,
  bankController,
  accountCache
);
export default syncController;
