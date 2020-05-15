require('module-alias/register');
var express = require('express');
import * as path from 'path';
var cors = require('cors');
var createError = require('http-errors');
require('@src/controllers/bank-controller/scheduler');

import * as bankConnectionsRouter from '@root/src/routes/connections';
import * as transactionsRouter from '@routes/transactions';
import * as accountRouter from '@routes/accounts';
import * as categoryRouter from '@routes/categories';
import * as businessRouter from '@routes/businesses';
import logger from '@src/logger';
import { BankAdaptorBase } from './src/models/bank-adaptor-base';

export const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/bank-connections', bankConnectionsRouter);
app.use('/transactions', transactionsRouter);
app.use('/accounts', accountRouter);
app.use('/categories', categoryRouter);
app.use('/business', businessRouter);

app.use(function(req, res, next) {
  next(createError(404));
});

BankAdaptorBase.removeOldFiles();

app.use(function(error, req, res, next) {
  if (error) {
    logger.error(`Error: ${error.message || error}`);
  }
  res.locals.message = error.message;
  res.locals.error = req.app.get('env') === 'development' ? error : {};
  res.status(error.status || 500);
  res.render('error');
});
