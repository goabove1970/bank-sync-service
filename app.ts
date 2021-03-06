require("module-alias/register");
var express = require("express");
import * as path from "path";
var cors = require("cors");
var createError = require("http-errors");
var bodyParser = require("body-parser");
require("@src/controllers/scheduler");

import * as bankConnectionsRouter from "@root/src/routes/connections-router";
import logger from "@src/logger";
import { BankAdaptorBase } from "./src/models/bank-adaptor-base";

export const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: false }));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use("/bank-connections", bankConnectionsRouter);

app.use(function(req, res, next) {
  next(createError(404));
});

BankAdaptorBase.removeOldFiles();

app.use(function(error, req, res, next) {
  if (error) {
    logger.error(`Error: ${error.message || error}`);
  }
  res.locals.message = error.message;
  res.locals.error = req.app.get("env") === "development" ? error : {};
  res.status(error.status || 500);
  res.render("error");
});
