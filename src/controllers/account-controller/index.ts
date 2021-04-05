import { ReadAccountArgs } from '@models/accounts/ReadAccountArgs';
import { AccountCreateArgs } from '@models/accounts/AccountCreateArgs';
import { AccountUpdateArgs } from '@models/accounts/AccountUpdateArgs';
import { AccountResponseModel } from '../data-controller/account/AccountResponseModel';
import { CONFIG, ServiceConfig } from '@root/app.config';
import { AccountRequestBase, AccountResponseBase } from '@root/src/models/RequestBase';
import * as http from 'http';
import logger from '@root/src/logger';

class AccountController {
  config: ServiceConfig;
  routerName: string;
    constructor(config: ServiceConfig) {
        this.config = config;
        this.routerName = '/accounts';
    }

  read(args: ReadAccountArgs): Promise<AccountResponseModel[]> {
    const serviceArgs: AccountRequestBase = {
      args,
      action: 'read-accounts'
    }
    const response = callService(this.config, this.routerName, serviceArgs).then((data: AccountResponseBase) => {
      console.log(`Account response: ${JSON.stringify(data)}`);
      const result: AccountResponseModel[] = data.payload.accounts;
      return result;
    }).catch(e => {
      const errorMessage = e.message || e;
      console.error(errorMessage);
      logger.error(errorMessage);
      return [];
    });
    return response;
  }
  create(args: AccountCreateArgs): Promise<string> {
    throw "not implemented, need to add passthrough logic";
  }
  assignUser(userId: string, accountId: string): Promise<void> {
    throw "not implemented, need to add passthrough logic";
  }
  update(args: AccountUpdateArgs): Promise<void> {
    throw "not implemented, need to add passthrough logic";
  }
}

export const callService = (config: ServiceConfig,  routerName: string, rqst: AccountRequestBase): Promise<AccountResponseBase> => {
  const bodyString = JSON.stringify(rqst);
    const httpOptions = {
      method: 'POST',
      hostname: config.url,
      port: config.port,
      path: routerName,
      headers: {
          'content-type': 'application/json',
          'content-length': Buffer.byteLength(bodyString),
      },
  };

  let res = new Promise<AccountResponseBase>((resolve, reject) => {
    const req = http.request(httpOptions, (res) => {
      let buffer: Buffer;
      res.on('data', (chunk: Buffer) => {
        if (!buffer) {
          buffer = chunk;
        } else {
          buffer = Buffer.concat([buffer, chunk]);
        }
      });

      res.on('end', () => {
        if (!buffer) {
          return reject(`No data was received from ${routerName}`)
        }
        const results = buffer.toString();
        const data = JSON.parse(results) as AccountResponseBase;
        if (data.error) {
          return reject(`Error received from ${routerName}: ${data.error}`)
        }
        resolve(data);
      });
    });

    req.on('error', (err) => {
      console.error(`Error: ${err.message || err}`);
      reject(err);
    });

    req.write(bodyString);
    req.end();
  });
  return res;
}

const accountController: AccountController = new AccountController(CONFIG.ApiServiceConfig);
export default accountController;
