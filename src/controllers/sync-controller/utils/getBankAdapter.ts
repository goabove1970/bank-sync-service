import logger from "@root/src/logger";
import { BankAdaptorBase } from "@root/src/models/bank-adaptor-base";
import { BankConnection } from "@root/src/models/bank-connection";
import { ChaseBankAdaptor } from "../adapters/chase";

export class BankAdaptorFabric {
  getBankAdapter = (conn: BankConnection): BankAdaptorBase => {
    // find bank adapter
    let bankAdapter: BankAdaptorBase = undefined;
    switch (conn.bankName) {
      case "chase":
        bankAdapter = new ChaseBankAdaptor(conn.login, conn.password);
        break;
      case "MOCK":
        throw "should not get here";

      default:
        logger.error(`Can not find bank adapter for bank [${conn.bankName}].`);
    }

    return bankAdapter;
  };
}

const bankAdaptorFabric = new BankAdaptorFabric();
export default bankAdaptorFabric;
