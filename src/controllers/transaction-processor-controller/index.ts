import { getConfig } from "@root/app.config";
import { TransactionProcessor } from "./call-through-transaction-processor";

export const transactionProcessor = new TransactionProcessor(
  getConfig().ApiServiceConfig
);
