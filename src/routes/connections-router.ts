import {
  BankConnectionResponse,
  BankSyncRequest,
  BankSyncRequestType,
} from "./connections-request";
import { Router } from "express";
import { BankConnectionError } from "@root/src/models/errors";
import { bankController } from "../controllers/bank-controller";
import syncController from "../controllers/sync-controller";
import scheduler from "../controllers/scheduler";
import { ConnectionsRequestProcessor } from "./connections-request-proecessor";
import accountController from "../controllers/account-controller";

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
    return res.status(500).send(new BankConnectionError());
  }

  let responseData: BankConnectionResponse = {};

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
