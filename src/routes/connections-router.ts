import {
  BankConnectionResponse,
  BankSyncRequest,
  BankSyncRequestType,
} from "./connections-request";
import { Router } from "express";
import { bankController } from "../controllers/bank-controller";
import syncController from "../controllers/sync-controller";
import scheduler from "../controllers/scheduler";
import { ConnectionsRequestProcessor } from "./connections-request-proecessor";
import accountController from "../controllers/account-controller";
import { ErrorCode } from "../models/error-codes";

const router = Router();

const processor = new ConnectionsRequestProcessor(
  bankController,
  syncController,
  accountController,
  scheduler
);

const process = async function(req, res, next) {
  const bankSyncRequest = req.body as BankSyncRequest;
  if (!bankSyncRequest) {
    const errorResponse: BankConnectionResponse = {
      action: undefined,
      error: 'Invalid request: request body is required',
      errorCode: ErrorCode.INVALID_REQUEST,
    };
    return res.status(400).send(errorResponse);
  }

  let responseData: BankConnectionResponse = {
    action: bankSyncRequest.action,
  };

  switch (bankSyncRequest.action) {
    case BankSyncRequestType.AddBankConnection:
      responseData = await processor.processAddBankConnectionRequest(
        bankSyncRequest.args
      );
      break;
    case BankSyncRequestType.GetBankConnections:
      responseData = await processor.processReadBankConnectionsRequest(
        bankSyncRequest.args
      );
      break;
    case BankSyncRequestType.RemoveBankConnection:
      responseData = await processor.processRemoveBankConnectionRequest(
        bankSyncRequest.args
      );
      break;
    case BankSyncRequestType.UpdateBankConnection:
      responseData = await processor.processUpdateBankConnectionRequest(
        bankSyncRequest.args
      );
      break;
    case BankSyncRequestType.Synchonize:
      responseData = await processor.processSyncBankConnectionsRequest(
        bankSyncRequest.args
      );
      break;
    default:
      if (bankSyncRequest.action) {
        responseData.error = `Invalid action: ${bankSyncRequest.action}`;
      } else {
        responseData.error = 'Invalid request: action is required';
      }
      responseData.errorCode = ErrorCode.INVALID_ACTION;
      break;
  }

  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "content-type");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  res.send(responseData);
};

router.post("/", process);
router.get("/", process);

export = router;
