import {
  BankConnectionResponse,
  BankSyncArgs,
  BankSyncRequestType,
} from './connections-request';
import { BankController } from '../controllers/bank-controller';
import { BankConnection } from '../models/bank-connection';
import { GuidFull } from '../utils/generateGuid';
import * as moment from 'moment';
import { BankConnectionStatus } from '../models/bank-connection-status';
import { SyncController } from '../controllers/sync-controller';
import { AccountType } from '../models/accounts/Account';
import { AccountCreateArgs } from '../models/accounts/AccountCreateArgs';
import { isCreditAccountType } from '../utils/accountUtils';
import { AccountController } from '../controllers/account-controller';
import { SyncScheduler } from '../controllers/scheduler';
import logger from '../logger';
import { toResponseBankConnection } from './connection-route-utils';

export class ConnectionsRequestProcessor {
  bankConnectionsControlelr: BankController;
  pollController: SyncController;
  accountController: AccountController;
  scheduler: SyncScheduler;
  constructor(
    bankConnectionsControlelr: BankController,
    pollController: SyncController,
    accountController: AccountController,
    scheduler: SyncScheduler
  ) {
    this.bankConnectionsControlelr = bankConnectionsControlelr;
    this.pollController = pollController;
    this.accountController = accountController;
    this.scheduler = scheduler;
  }

  async processAddBankConnectionRequest(
    args: BankSyncArgs
  ): Promise<BankConnectionResponse> {
    const response: BankConnectionResponse = {
      action: BankSyncRequestType.AddBankConnection,
      payload: {
        userId: args.userId,
      },
    };

    const connections = await this.bankConnectionsControlelr.read({
      userId: args.userId,
    });
    if (
      connections.some(
        (c) => c.bankName === args.bankName && c.login === args.login
      )
    ) {
      response.error = `Bank connection ${args.bankName}:${args.login} already exists for user ${args.userId}`;
      response.errorCode = 2026;
      return response;
    }

    const newBankConnection: BankConnection = {
      connectionId: GuidFull(),
      dateAdded: moment().toDate(),
      userId: args.userId,
      bankName: args.bankName,
      login: args.login,
      password: args.password,
      status: BankConnectionStatus.Active,
    };

    const linkedAccounts = [];

    try {
      const connectionStatus = await this.pollController.getConnectionStatus(
        newBankConnection
      );
      if (
        connectionStatus.statusData &&
        connectionStatus.statusData.severity !== 'ERROR'
      ) {
        newBankConnection.status |= BankConnectionStatus.Validated;
        // add new bank account records to 'accounts' table

        for (let it = 0; it < (connectionStatus.accounts || []).length; ++it) {
          const acct = connectionStatus.accounts[it];
          const type =
            acct.acctype === 'CHECKING'
              ? AccountType.Debit | AccountType.Checking
              : AccountType.Credit;
          const acctCreateArgs: AccountCreateArgs = {
            userId: args.userId,
            bankRoutingNumber: acct.bankId || acct.accountId,
            bankAccountNumber: acct.accountId,
            bankName: args.bankName,
            accountType: type,
            serviceComment: acct.acctype,
            alias: acct.description,
          };
          if (isCreditAccountType(type)) {
            acctCreateArgs.cardNumber = acct.accountId;
          }
          const accountId = await this.accountController.create(acctCreateArgs);
          await this.accountController.assignUser(args.userId, accountId);
          linkedAccounts.push({
            bankAccountNumber: acct.accountId,
            accountId,
          });
        }
      } else {
        newBankConnection.status |= BankConnectionStatus.CouldNotConnect;
      }

      await this.bankConnectionsControlelr.create(newBankConnection);

      response.payload = {
        ...response.payload,
        connectionId: newBankConnection.connectionId,
        connections: [toResponseBankConnection(newBankConnection)],
        bankSeverity:
          connectionStatus.statusData && connectionStatus.statusData.severity,
        bankMessage:
          connectionStatus.statusData && connectionStatus.statusData.message,
        bankCode:
          connectionStatus.statusData && connectionStatus.statusData.code,
        linkedAccounts,
      };
    } catch (error) {
      console.error(error.message || error);
      response.error = error.message || error;
    }
    return response;
  }

  async processReadBankConnectionsRequest(
    args: BankSyncArgs
  ): Promise<BankConnectionResponse> {
    const response: BankConnectionResponse = {
      action: BankSyncRequestType.GetBankConnections,
      payload: {
        connectionId: args.connectionId,
      },
    };

    try {
      let connections = await this.bankConnectionsControlelr.read({
        userId: args.userId,
      });
      connections = connections.map((c: BankConnection) => {
        return toResponseBankConnection(c);
      });
      response.payload = {
        ...response.payload,
        connections,
      };
      return response;
    } catch (error) {
      console.error(error.message || error);
      response.error = error.message || error;
    }
    return response;
  }

  async processRemoveBankConnectionRequest(
    args: BankSyncArgs
  ): Promise<BankConnectionResponse> {
    const response: BankConnectionResponse = {
      action: BankSyncRequestType.RemoveBankConnection,
      payload: {
        connectionId: args.connectionId,
      },
    };

    try {
      const connections = await this.bankConnectionsControlelr.read({
        connectionId: args.connectionId,
      });
      if (!connections || !connections.length || connections.length !== 1) {
        const error = `Can not remove connection ${args.connectionId}, connection was not found, please check connectionId.`;
        logger.error(error);
        response.error = error;
        response.errorCode = 2022;
        return response;
      }
      const connection = connections[0];

      await this.bankConnectionsControlelr.delete({
        connectionId: args.connectionId,
      });
      response.payload = {
        ...response.payload,
        userId: connection.userId,
      };
    } catch (error) {
      console.error(error.message || error);
      response.error = error.message || error;
    }
    return response;
  }

  async processUpdateBankConnectionRequest(
    args: BankSyncArgs
  ): Promise<BankConnectionResponse> {
    const response: BankConnectionResponse = {
      action: BankSyncRequestType.UpdateBankConnection,
      payload: {
        connectionId: args.connectionId,
      },
    };

    try {
      const connections = await this.bankConnectionsControlelr.read({
        connectionId: args.connectionId,
      });
      if (!connections || !connections.length || connections.length !== 1) {
        const error = `Can not update connection ${args.connectionId}, connection was not found, please check connectionId.`;
        logger.error(error);
        response.error = error;
        response.errorCode = 2023;
        return response;
      }
      const connection = connections[0];

      if (args.login) {
        connection.login = args.login;
      }

      if (args.password) {
        connection.password = args.password;
      }

      if (args.suspend === true) {
        connection.status = connection.status || 0;
        connection.status |= BankConnectionStatus.Suspended;
      } else if (args.suspend === false) {
        connection.status = connection.status || 0;
        connection.status &= ~BankConnectionStatus.Suspended;
      }

      const connectionStatus = await this.pollController.getConnectionStatus(
        connection
      );
      if (
        connectionStatus.statusData &&
        connectionStatus.statusData.severity !== 'ERROR'
      ) {
        connection.status |= BankConnectionStatus.Validated;
      } else {
        connection.status |= BankConnectionStatus.CouldNotConnect;
      }

      await this.bankConnectionsControlelr.update(connection);

      // test updated connection and see it it's valid

      response.payload = {
        ...response.payload,
        userId: connection.userId,
        connections: [toResponseBankConnection(connection)],
        bankSeverity:
          connectionStatus.statusData && connectionStatus.statusData.severity,
        bankMessage:
          connectionStatus.statusData && connectionStatus.statusData.message,
        bankCode:
          connectionStatus.statusData && connectionStatus.statusData.code,
      };
    } catch (error) {
      console.error(error.message || error);
      response.error = error.message || error;
    }
    return response;
  }

  async processSyncBankConnectionsRequest(
    args: BankSyncArgs
  ): Promise<BankConnectionResponse> {
    const response: BankConnectionResponse = {
      action: BankSyncRequestType.Synchonize,
      payload: {
        connectionId: args.connectionId,
        userId: args.userId,
      },
    };

    try {
      const syncData = await this.pollController.executeSync(
        args.userId,
        args.connectionId,
        true
      );

      // delete senditive/service data
      syncData.forEach((sd) => {
        delete sd.password;
        delete sd.userId;
        delete sd.lastPollDate;
        delete sd.dateAdded;
        if (sd.lastPollStats) {
          delete sd.lastPollStats.userId;
          if (sd.lastPollStats.accounts) {
            sd.lastPollStats.accounts.forEach((acc) => {
              if (acc.accountData) {
                delete acc.accountData.transactions;
              }
            });
          }
        }
      });
      response.payload = {
        ...response.payload,
        syncData,
      };
    } catch (error) {
      console.error(error.message || error);
      response.error = error.message || error;
    }
    return response;
  }
}
