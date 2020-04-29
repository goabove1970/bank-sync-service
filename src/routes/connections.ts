import { BankConnectionResponse, BankSyncRequest, BankSyncRequestType, BankSyncArgs } from './connections-request';
import { Router } from 'express';
import { BankConnectionError } from '@root/src/models/errors';
import * as moment from 'moment';
import { bankConnectionController as databaseController } from '../controllers/connections-controller';
import { GuidFull } from '../utils/generateGuid';
import logger from '../logger';
import { BankConnection } from '../models/bank-connection';
import {
  BankConnectionStatus,
  isConnectionActive,
  isBankActivationRequired,
  isCouldNotConnect,
  isSuspended,
  isValidated,
} from '../models/bank-connection-status';
import pollController from '../controllers/bank-controller';

const router = Router();

const toResponseBankConnection = (c: BankConnection): any => {
  return {
    ...c,
    isConnectionActive: isConnectionActive(c.status),
    isBankActivationRequired: isBankActivationRequired(c.status),
    isCouldNotConnect: isCouldNotConnect(c.status),
    isSuspended: isSuspended(c.status),
    isValidated: isValidated(c.status),
  };
};

const process = async function(req, res, next) {
  const bankSyncRequest = req.body as BankSyncRequest;
  if (!bankSyncRequest) {
    return res.status(500).send(new BankConnectionError());
  }

  let responseData: BankConnectionResponse = {};

  switch (bankSyncRequest.action) {
    case BankSyncRequestType.AddBankConnection:
      responseData = await processAddBankConnectionRequest(bankSyncRequest.args);
      break;
    case BankSyncRequestType.GetBankConnections:
      responseData = await processReadBankConnectionsRequest(bankSyncRequest.args);
      break;
    case BankSyncRequestType.RemoveBankConnection:
      responseData = await processRemoveBankConnectionRequest(bankSyncRequest.args);
      break;
    case BankSyncRequestType.UpdateBankConnection:
      responseData = await processUpdateBankConnectionRequest(bankSyncRequest.args);
      break;
  }

  res.send(responseData);
};

router.post('/', process);
router.get('/', process);

async function processAddBankConnectionRequest(args: BankSyncArgs): Promise<BankConnectionResponse> {
  const response: BankConnectionResponse = {
    action: BankSyncRequestType.AddBankConnection,
    payload: {
      userId: args.userId,
    },
  };

  const newBankConnection: BankConnection = {
    connectionId: GuidFull(),
    dateAdded: moment().toDate(),
    userId: args.userId,
    bankName: args.bankName,
    login: args.login,
    password: args.password,
    status: BankConnectionStatus.Active,
  };

  try {
    const connectionStatus = await pollController.getConnectionStatus(newBankConnection);
    if (connectionStatus.statusData && connectionStatus.statusData.severity !== 'ERROR') {
      newBankConnection.status |= BankConnectionStatus.Validated;
    } else {
      newBankConnection.status |= BankConnectionStatus.CouldNotConnect;
    }

    await databaseController.create(newBankConnection);

    response.payload = {
      ...response.payload,
      connectionId: newBankConnection.connectionId,
      connections: [toResponseBankConnection(newBankConnection)],
      bankSeverity: connectionStatus.statusData && connectionStatus.statusData.severity,
      bankMessage: connectionStatus.statusData && connectionStatus.statusData.message,
      bankCode: connectionStatus.statusData && connectionStatus.statusData.code,
    };
  } catch (error) {
    console.error(error.message || error);
    response.error = error.message || error;
  }
  return response;
}

async function processReadBankConnectionsRequest(args: BankSyncArgs): Promise<BankConnectionResponse> {
  const response: BankConnectionResponse = {
    action: BankSyncRequestType.GetBankConnections,
    payload: {
      connectionId: args.connectionId,
    },
  };

  try {
    let connections = await databaseController.read({ userId: args.userId });
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

async function processRemoveBankConnectionRequest(args: BankSyncArgs): Promise<BankConnectionResponse> {
  const response: BankConnectionResponse = {
    action: BankSyncRequestType.RemoveBankConnection,
    payload: {
      connectionId: args.connectionId,
    },
  };

  try {
    const connections = await databaseController.read({ connectionId: args.connectionId });
    if (!connections || !connections.length || connections.length !== 1) {
      const error = `Can not remove connection ${args.connectionId}, connection was not found, please check connectionId.`;
      logger.error(error);
      response.error = error;
      response.errorCode = 2022;
      return response;
    }
    const connection = connections[0];

    await databaseController.delete({ connectionId: args.connectionId });
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

async function processUpdateBankConnectionRequest(args: BankSyncArgs): Promise<BankConnectionResponse> {
  const response: BankConnectionResponse = {
    action: BankSyncRequestType.RemoveBankConnection,
    payload: {
      connectionId: args.connectionId,
    },
  };

  try {
    const connections = await databaseController.read({ connectionId: args.connectionId });
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

    const connectionStatus = await pollController.getConnectionStatus(connection);
    if (connectionStatus.statusData && connectionStatus.statusData.severity !== 'ERROR') {
      connection.status |= BankConnectionStatus.Validated;
    } else {
      connection.status |= BankConnectionStatus.CouldNotConnect;
    }

    await databaseController.update(connection);

    // test updated connection and see it it's valid

    response.payload = {
      ...response.payload,
      userId: connection.userId,
      connections: [toResponseBankConnection(connection)],
      bankSeverity: connectionStatus.statusData && connectionStatus.statusData.severity,
      bankMessage: connectionStatus.statusData && connectionStatus.statusData.message,
      bankCode: connectionStatus.statusData && connectionStatus.statusData.code,
    };
  } catch (error) {
    console.error(error.message || error);
    response.error = error.message || error;
  }
  return response;
}

export = router;
