import { ServiceConfig } from "@root/app.config";
import logger from "@root/src/logger";
import { RequestBase, ResponseBase } from "@root/src/models/RequestBase";
import { TransactionReadArg } from "@root/src/models/transaction/TransactionReadArgs";
import { callService } from "@root/src/utils/callService";
import { Transaction } from "@src/models/transaction/Transaction";
import { TransactionImprtResult } from "./transaction-import-result";

export class TransactionProcessor {
  config: ServiceConfig;
  routerName: string;
  constructor(config: ServiceConfig) {
    this.config = config;
    this.routerName = "/transactions";
  }

  async addTransactions(
    bulk: Transaction[],
    accountId: string
  ): Promise<TransactionImprtResult> {
    const serviceArgs: RequestBase = {
      args: {
        transactions: bulk,
        accountId,
      },
      action: "add-transactions",
    };
    const response = callService(this.config, this.routerName, serviceArgs)
      .then((data: ResponseBase) => {
        const accountData = data.payload as TransactionImprtResult;
        logger.info(`Account response: ${JSON.stringify(accountData)}`);
        return accountData;
      })
      .catch((e) => {
        const errorMessage = e.message || e;
        console.error(errorMessage);
        logger.error(errorMessage);
        let resp: TransactionImprtResult;
        return resp;
      });
    return response;
  }

  async readTransactions(
    args: TransactionReadArg
  ): Promise<number | Transaction[]> {
    const serviceArgs: RequestBase = {
      args,
      action: "read-transactions",
    };
    const response = callService(this.config, this.routerName, serviceArgs)
      .then((data: ResponseBase) => {
        const responseData = data.payload as number | Transaction[];
        logger.info(`Account response: ${JSON.stringify(responseData)}`);
        return responseData;
      })
      .catch((e) => {
        const errorMessage = e.message || e;
        console.error(errorMessage);
        logger.error(errorMessage);
        let resp: number | Transaction[];
        return resp;
      });
    return response;
  }
}
