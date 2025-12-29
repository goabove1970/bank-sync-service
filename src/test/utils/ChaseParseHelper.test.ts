import {
  parseChaseTransDetails,
  parseChaseTransactionType,
  parseCreditCardTransactionType,
} from "@utils/ChaseParseHelper";
import { ChaseTransactionOriginType } from "@models/transaction/chase/ChaseTransactionOriginType";
import { ChaseTransactionType } from "@models/transaction/chase/ChaseTransactionType";
import { CreditCardTransactionType } from "@models/transaction/chase/ChaseTransactionType";

describe("ChaseParseHelper", () => {
  describe("parseChaseTransDetails", () => {
    it("should parse DEBIT correctly", () => {
      expect(parseChaseTransDetails("DEBIT")).toBe(
        ChaseTransactionOriginType.Debit
      );
    });

    it("should parse XFER correctly", () => {
      expect(parseChaseTransDetails("XFER")).toBe(
        ChaseTransactionOriginType.Xfer
      );
    });

    it("should parse FEE correctly", () => {
      expect(parseChaseTransDetails("FEE")).toBe(
        ChaseTransactionOriginType.Fee
      );
    });

    it("should parse CREDIT correctly", () => {
      expect(parseChaseTransDetails("CREDIT")).toBe(
        ChaseTransactionOriginType.Credit
      );
    });

    it("should parse ATM correctly", () => {
      expect(parseChaseTransDetails("ATM")).toBe(
        ChaseTransactionOriginType.Atm
      );
    });

    it("should parse CHECK correctly", () => {
      expect(parseChaseTransDetails("CHECK")).toBe(
        ChaseTransactionOriginType.Check
      );
    });

    it("should parse DSLIP correctly", () => {
      expect(parseChaseTransDetails("DSLIP")).toBe(
        ChaseTransactionOriginType.Dslip
      );
    });

    it("should parse OTHER correctly", () => {
      expect(parseChaseTransDetails("OTHER")).toBe(
        ChaseTransactionOriginType.Other
      );
    });

    it("should return Unknown for unrecognized values", () => {
      expect(parseChaseTransDetails("UNKNOWN_TYPE")).toBe(
        ChaseTransactionOriginType.Unknown
      );
      expect(parseChaseTransDetails("")).toBe(
        ChaseTransactionOriginType.Unknown
      );
    });
  });

  describe("parseCreditCardTransactionType", () => {
    it("should parse Adjustment correctly", () => {
      expect(parseCreditCardTransactionType("Adjustment")).toBe(
        CreditCardTransactionType.Adjustment
      );
    });

    it("should parse Fee correctly", () => {
      expect(parseCreditCardTransactionType("Fee")).toBe(
        CreditCardTransactionType.Fee
      );
    });

    it("should parse Payment correctly", () => {
      expect(parseCreditCardTransactionType("Payment")).toBe(
        CreditCardTransactionType.Payment
      );
    });

    it("should parse Return correctly", () => {
      expect(parseCreditCardTransactionType("Return")).toBe(
        CreditCardTransactionType.Return
      );
    });

    it("should parse Sale correctly", () => {
      expect(parseCreditCardTransactionType("Sale")).toBe(
        CreditCardTransactionType.Sale
      );
    });

    it("should return Undefined for unrecognized values", () => {
      expect(parseCreditCardTransactionType("Unknown")).toBe(
        CreditCardTransactionType.Undefined
      );
      expect(parseCreditCardTransactionType("")).toBe(
        CreditCardTransactionType.Undefined
      );
    });
  });

  describe("parseChaseTransactionType", () => {
    it("should parse XFER correctly", () => {
      expect(parseChaseTransactionType("XFER")).toBe(
        ChaseTransactionType.AccountTransfer
      );
    });

    it("should parse ACCT_XFER correctly", () => {
      expect(parseChaseTransactionType("ACCT_XFER")).toBe(
        ChaseTransactionType.AccountTransfer
      );
    });

    it("should parse ACH_CREDIT correctly", () => {
      expect(parseChaseTransactionType("ACH_CREDIT")).toBe(
        ChaseTransactionType.AchCredit
      );
    });

    it("should parse ACH_DEBIT correctly", () => {
      expect(parseChaseTransactionType("ACH_DEBIT")).toBe(
        ChaseTransactionType.AchDebit
      );
    });

    it("should parse ATM correctly", () => {
      expect(parseChaseTransactionType("ATM")).toBe(ChaseTransactionType.Atm);
    });

    it("should parse ATM_DEPOSIT correctly", () => {
      expect(parseChaseTransactionType("ATM_DEPOSIT")).toBe(
        ChaseTransactionType.AtmDeposit
      );
    });

    it("should parse DEBIT_CARD correctly", () => {
      expect(parseChaseTransactionType("DEBIT_CARD")).toBe(
        ChaseTransactionType.DebitCard
      );
    });

    it("should parse DEPOSIT correctly", () => {
      expect(parseChaseTransactionType("DEPOSIT")).toBe(
        ChaseTransactionType.Deposit
      );
    });

    it("should parse FEE correctly", () => {
      expect(parseChaseTransactionType("FEE")).toBe(
        ChaseTransactionType.FeeTransaction
      );
    });

    it("should parse FEE_TRANSACTION correctly", () => {
      expect(parseChaseTransactionType("FEE_TRANSACTION")).toBe(
        ChaseTransactionType.FeeTransaction
      );
    });

    it("should parse CHECK_DEPOSIT correctly", () => {
      expect(parseChaseTransactionType("CHECK_DEPOSIT")).toBe(
        ChaseTransactionType.CheckDeposit
      );
    });

    it("should parse CHECK_PAID correctly", () => {
      expect(parseChaseTransactionType("CHECK_PAID")).toBe(
        ChaseTransactionType.CheckPaid
      );
    });

    it("should parse WIRE_OUTGOING correctly", () => {
      expect(parseChaseTransactionType("WIRE_OUTGOING")).toBe(
        ChaseTransactionType.WireOutgoing
      );
    });

    it("should parse WIRE_INGOING correctly", () => {
      expect(parseChaseTransactionType("WIRE_INGOING")).toBe(
        ChaseTransactionType.WireIngoing
      );
    });

    it("should return Undefined for unrecognized values", () => {
      expect(parseChaseTransactionType("UNKNOWN")).toBe(
        ChaseTransactionType.Undefined
      );
      expect(parseChaseTransactionType("")).toBe(
        ChaseTransactionType.Undefined
      );
    });
  });
});

