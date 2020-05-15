import {
  TransactionRequest,
  TransactionResponse,
  ReadTransactionArgs,
  TransactionRequestType,
  TransactionImportArgs,
  TransactioCsvFileImportArgs,
  TransactionDeleteArgs,
  TryRegexParseArgs,
  UpdateTransactionArgs,
} from './request-types/TransactionRequests';
import { Router } from 'express';
import { TransactionError } from '@models/errors/errors';
import { isHiddenTransaction, isExcludedFromBalanceTransaction } from '@utils/transUtils';
import * as moment from 'moment';
import { TransactionReadArg } from '@models/transaction/TransactionReadArgs';
import { transactionProcessor } from '../controllers/transaction-processor-controller/TransactionProcessor';
import { Transaction, TransactionUpdateArgs } from '../models/transaction/Transaction';
import categoryController from '../controllers/category-controller';
import { GuidEight } from '../utils/generateGuid';
import { inspect } from 'util';
import userController from '../controllers/user-controller';
var multiparty = require('multiparty');
const fs = require('fs');
const path = require('path');

const router = Router();

const process = async function(req, res, next) {
  console.log(`Received a request in transaction controller: ${JSON.stringify(req.body, null, 4)}`);
  const transactionRequest = req.body as TransactionRequest;
  if (!transactionRequest) {
    return res.status(500).send(new TransactionError());
  }

  let responseData: TransactionResponse = {};
  console.log(`Processing ${transactionRequest.action} request`);

  switch (transactionRequest.action) {
    case TransactionRequestType.ReadTransactions:
      responseData = await processReadTransactionsRequest(transactionRequest.args as ReadTransactionArgs);
      break;
    case TransactionRequestType.ImportTransaction:
      responseData = await processImportTransactionRequest(transactionRequest.args as TransactionImportArgs);
      break;
    case TransactionRequestType.Delete:
      responseData = await processDeleteTransactionRequest(transactionRequest.args as TransactionDeleteArgs);
      break;
    case TransactionRequestType.ImportTransactionCsvFile:
      responseData = await processImportTransactionFileRequest(transactionRequest.args as TransactioCsvFileImportArgs);
      break;
    case TransactionRequestType.TestRegex:
      responseData = await processTestRegexRequest(transactionRequest.args as TryRegexParseArgs);
      break;
    case TransactionRequestType.TestBusinessRegex:
      responseData = await processTestBusinessRegexRequest(transactionRequest.args as TryRegexParseArgs);
      break;
    case TransactionRequestType.Recognize:
      responseData = await processRecognizeRequest();
      break;
    case TransactionRequestType.Update:
      responseData = await processUpdateTransactionRequest(transactionRequest.args as UpdateTransactionArgs);
      break;
  }

  res.send(responseData);
};

router.post('/', process);
router.get('/', process);
router.post('/upload/*', processUploadRequest);

async function processUpdateTransactionRequest(args: UpdateTransactionArgs): Promise<TransactionResponse> {
  const response: TransactionResponse = { action: TransactionRequestType.Update, payload: {} };

  const updateTransactionArgs: TransactionUpdateArgs = {
    categoryId: args.categoryId,
    transactionId: args.transactionId,
    statusModification: args.statusModification,
  };

  try {
    await transactionProcessor.update(updateTransactionArgs);
  } catch (error) {
    console.error(error.message);
    response.error = error.message;
  }
  return response;
}

async function processReadTransactionsRequest(args: ReadTransactionArgs): Promise<TransactionResponse> {
  const response: TransactionResponse = {
    action: TransactionRequestType.ReadTransactions,
    payload: {},
  };

  let accounts = args.accountId ? [args.accountId] : [];
  if (args.userId) {
    accounts = [];
    const accts = await userController.getUserAccountLinks({
      userId: args.userId,
    });
    accounts = accts.map((u) => u.accountId);
  }

  const readArgs: TransactionReadArg = {
    startDate: args && args.startDate && moment(args.startDate).toDate(),
    endDate: args && args.endDate && moment(args.endDate).toDate(),
    accountIds: accounts,
    categorization: args.categorization,
  };
  try {
    const transactionsReadResult = await transactionProcessor.read(readArgs);
    if (args.countOnly) {
      const number = transactionsReadResult as number;
      response.payload = {
        count: number,
      };
    } else {
      const transactions = transactionsReadResult as Transaction[];
      response.payload = {
        count: transactions.length,
        transactions: transactions.map((t) => {
          return {
            ...t,
            isHidden: isHiddenTransaction(t),
            isExcluded: isExcludedFromBalanceTransaction(t),
          };
        }),
      };
      if (args.categoryId) {
        const categories = await categoryController.read({ userId: args.userId });
        const categoriesSet = new Set<string>();
        categoriesSet.add(args.categoryId);
        categories.forEach((c) => {
          if (c.parentCategoryId === args.categoryId) {
            if (!categoriesSet.has(c.categoryId)) {
              categoriesSet.add(c.categoryId);
            }
          }
        });
        response.payload.transactions = (response.payload.transactions || []).filter((t: Transaction) => {
          return categoriesSet.has(t.categoryId);
        });
      }
    }
  } catch (error) {
    console.error(error.message);
    response.error = error.message;
  }
  return response;
}

async function processImportTransactionRequest(args: TransactionImportArgs): Promise<TransactionResponse> {
  const response: TransactionResponse = {
    action: TransactionRequestType.ImportTransaction,
    payload: {},
  };

  try {
    const importResult = await transactionProcessor.addTransaction(args.transaction, args.accountId);
    response.payload = {
      ...importResult,
    };
  } catch (error) {
    console.error(error.message);
    response.error = error.message;
  }
  return response;
}

async function processDeleteTransactionRequest(args: TransactionDeleteArgs): Promise<TransactionResponse> {
  const response: TransactionResponse = {
    action: TransactionRequestType.Delete,
    payload: {},
  };

  try {
    const transactionId = await transactionProcessor.delete(args);
    response.payload = {
      transactionId,
    };
  } catch (error) {
    console.error(error.message);
    response.error = error.message;
  }
  return response;
}

async function processImportTransactionFileRequest(args: TransactioCsvFileImportArgs): Promise<TransactionResponse> {
  const response: TransactionResponse = {
    action: TransactionRequestType.ImportTransaction,
    payload: {},
  };

  if (!args.accountId) {
    throw 'Can not import transactions to empty accountId';
  }

  try {
    const addResult = await transactionProcessor.importTransactionsFromCsv(args.file, args.accountId);
    response.payload = {
      addResult,
    };
  } catch (error) {
    console.error(error.message);
    response.error = error.message;
  }
  return response;
}

async function processUploadRequest(req, res, next) {
  let parts = req.originalUrl && req.originalUrl.split('/');
  let acct = '';
  if (parts.length > 0) {
    acct = parts[parts.length - 1];
  }
  console.log(`Acct: ${acct}`);
  var form = new multiparty.Form();
  var count = 0;
  let tmpDir = './tmp';
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir);
  }
  tmpDir = './tmp/fileUploads';
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir);
  } else {
    //Todo: delete old files
  }
  const fileName = path.join(tmpDir, `${GuidEight()}.tmp`);

  form.on('error', function(err) {
    console.log('Error parsing form: ' + err.stack);
  });
  form.on('part', function(part) {
    if (!part.filename) {
      console.log('got field named ' + part.name);
      part.resume();
    }

    if (part.filename) {
      const w = fs.createWriteStream(fileName);
      part.pipe(w);
      count++;
      part.resume();
    }

    part.on('error', function(err) {
      console.error(`Error receiving transactions file: ${err.message || err}`);
    });
  });

  form.on('close', function() {
    console.log('Upload completed!');
    fs.readFile(fileName, (error, data) => {
      if (error) {
        throw 'Error processing transaction file';
      }
      const dataStr = data.toString();
      processImportTransactionFileRequest({
        file: dataStr,
        accountId: acct,
      })
        .then((importRes: any) => {
          console.log(inspect(importRes));
          res.send(importRes);
        })
        .catch(() => {
          console.error('Error processing transaction file received');
          res.end('Received ' + count + ' files');
        });
    });
  });

  form.parse(req);
}

async function processTestRegexRequest(args: TryRegexParseArgs): Promise<TransactionResponse> {
  const response: TransactionResponse = {
    action: TransactionRequestType.TestRegex,
    payload: {},
  };

  try {
    const addResult = await transactionProcessor.testRegex(args.regex);
    response.payload = {
      count: addResult.length,
      matchingTransactions: addResult,
    };
  } catch (error) {
    console.error(error.message);
    response.error = error.message;
  }
  return response;
}

async function processTestBusinessRegexRequest(args: TryRegexParseArgs): Promise<TransactionResponse> {
  const response: TransactionResponse = {
    action: TransactionRequestType.TestBusinessRegex,
    payload: {},
  };

  try {
    const addResult = await transactionProcessor.testBusinessRegex(args.businessId);
    response.payload = {
      count: addResult.length,
      matchingTransactions: addResult,
    };
  } catch (error) {
    console.error(error.message);
    response.error = error.message;
  }
  return response;
}

async function processRecognizeRequest(): Promise<TransactionResponse> {
  const response: TransactionResponse = {
    action: TransactionRequestType.Recognize,
    payload: {},
  };

  try {
    const addResult = await transactionProcessor.recognize();
    response.payload = {
      count: addResult.length,
      matchingTransactions: addResult,
    };
  } catch (error) {
    console.error(error.message);
    response.error = error.message;
  }
  return response;
}

export = router;
