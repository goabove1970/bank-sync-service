import { transactionProcessor } from "@root/src/controllers/transaction-processor-controller";
import { AccountTransactionsCache } from "./account-cache";

const accountCache = new AccountTransactionsCache(transactionProcessor);
export default accountCache;
