import { ReadAccountArgs } from "@models/accounts/ReadAccountArgs";
import { AccountCreateArgs } from "@models/accounts/AccountCreateArgs";
import { AccountUpdateArgs } from "@models/accounts/AccountUpdateArgs";
import { AccountResponseModel } from "./AccountResponseModel";
import { ServiceConfig } from "@root/app.config";
import {
  AccountRequestBase,
  AccountResponseBase,
  ResponseBase,
} from "@root/src/models/RequestBase";
import logger from "@root/src/logger";
import { callService } from "@root/src/utils/callService";

export class AccountController {
  config: ServiceConfig;
  routerName: string;
  constructor(config: ServiceConfig) {
    this.config = config;
    this.routerName = "/accounts";
  }

  read(args: ReadAccountArgs): Promise<AccountResponseModel[]> {
    const serviceArgs: AccountRequestBase = {
      args,
      action: "read-accounts",
    };
    const response = callService(this.config, this.routerName, serviceArgs)
      .then((data: ResponseBase) => {
        const accountData = data as AccountResponseBase;
        logger.info(`Account response: ${JSON.stringify(accountData)}`);
        const result: AccountResponseModel[] = accountData.payload.accounts;
        return result;
      })
      .catch((e) => {
        const errorMessage = e.message || e;
        logger.error(
          `Error while trying to call the service at ${JSON.stringify(
            this.config
          )}: ${errorMessage}`
        );
        throw e;
      });
    return response;
  }
  create(args: AccountCreateArgs): Promise<string> {
    const serviceArgs: AccountRequestBase = {
      args,
      action: "create-account",
    };
    const response = callService(this.config, this.routerName, serviceArgs)
      .then((data: ResponseBase) => {
        const accountData = data as AccountResponseBase;
        logger.info(`Account response: ${JSON.stringify(accountData)}`);
        const result: string = accountData.payload.accountId;
        return result;
      })
      .catch((e) => {
        const errorMessage = e.message || e;
        logger.error(
          `Error while trying to call the service at ${JSON.stringify(
            this.config
          )}: ${errorMessage}`
        );
        throw e;
      });
    return response;
  }
  assignUser(userId: string, accountId: string): Promise<void> {
    const serviceArgs: AccountRequestBase = {
      args: {
        userId,
        accountId,
      },
      action: "assign-user",
    };
    const response = callService(this.config, this.routerName, serviceArgs)
      .then((data: ResponseBase) => {
        const accountData = data as AccountResponseBase;
        logger.info(`Account response: ${JSON.stringify(accountData)}`);
        return Promise.resolve();
      })
      .catch((e) => {
        const errorMessage = e.message || e;
        logger.error(
          `Error while trying to call the service at ${JSON.stringify(
            this.config
          )}: ${errorMessage}`
        );
        throw e;
      });
    return response;
  }
  update(args: AccountUpdateArgs): Promise<void> {
    const serviceArgs: AccountRequestBase = {
      args,
      action: "assign-user",
    };
    const response = callService(this.config, this.routerName, serviceArgs)
      .then((data: ResponseBase) => {
        const accountData = data as AccountResponseBase;
        logger.info(`Account response: ${JSON.stringify(accountData)}`);
        return Promise.resolve();
      })
      .catch((e) => {
        const errorMessage = e.message || e;
        logger.error(
          `Error while trying to call the service at ${JSON.stringify(
            this.config
          )}: ${errorMessage}`
        );
        throw e;
      });
    return response;
  }
}
