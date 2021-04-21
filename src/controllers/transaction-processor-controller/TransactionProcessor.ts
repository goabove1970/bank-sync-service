import { CONFIG, ServiceConfig } from '@root/app.config';
import logger from '@root/src/logger';
import { RequestBase, ResponseBase } from '@root/src/models/RequestBase';
import { TransactionReadArg } from '@root/src/models/transaction/TransactionReadArgs';
import { callService } from '@root/src/utils/callService';
import { Transaction } from '@src/models/transaction/Transaction';

export interface TransactionImprtResult {
  parsed: number;
  duplicates: number;
  newTransactions: number;
  businessRecognized: number;
  multipleBusinessesMatched: number;
  unrecognized: number;
  unposted: number;
}

export class TransactionProcessor {
  config: ServiceConfig;
  routerName: string;
  constructor(config: ServiceConfig) {
    this.config = config;
    this.routerName = '/transactions';
}

  async addTransactions(bulk: Transaction[], accountId: string): Promise<TransactionImprtResult> {
    const serviceArgs: RequestBase = {
      args: {
        transactions: bulk,
        accountId
      },
      action: 'add-transactions'
    }
    const response = callService(this.config, this.routerName, serviceArgs).then((data: ResponseBase) => {
      const accountData = data.payload as TransactionImprtResult;
      console.log(`Account response: ${JSON.stringify(accountData)}`);
      return accountData;
    }).catch(e => {
      const errorMessage = e.message || e;
      console.error(errorMessage);
      logger.error(errorMessage);
      let resp: TransactionImprtResult
      return resp;
    });
    return response;
  }

  async readTransactions(args: TransactionReadArg): Promise<number | Transaction[]> {
    const serviceArgs: RequestBase = {
      args,
      action: 'read-transactions'
    }
    const response = callService(this.config, this.routerName, serviceArgs).then((data: ResponseBase) => {
      const responseData = data.payload as number | Transaction[];
      console.log(`Account response: ${JSON.stringify(responseData)}`);
      return responseData;
    }).catch(e => {
      const errorMessage = e.message || e;
      console.error(errorMessage);
      logger.error(errorMessage);
      let resp: number | Transaction[]
      return resp;
    });
    return response;
  }


}

export const transactionProcessor = new TransactionProcessor(CONFIG.ApiServiceConfig);
