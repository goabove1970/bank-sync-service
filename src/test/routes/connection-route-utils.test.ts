import { BankConnection } from "@models/bank-connection";
import { BankConnectionStatus } from "@models/bank-connection-status";
import { toResponseBankConnection } from "../../routes/connection-route-utils";

describe("connection-route-utils", () => {
  describe("toResponseBankConnection", () => {
    it("should convert bank connection to response format with all status flags", () => {
      const connection: BankConnection = {
        connectionId: "test-connection-id",
        userId: "test-user-id",
        bankName: "Test Bank",
        login: "test-login",
        password: "test-password",
        status: BankConnectionStatus.Active | BankConnectionStatus.Validated,
        dateAdded: new Date("2023-01-01"),
      };

      const result = toResponseBankConnection(connection);

      expect(result.connectionId).toBe(connection.connectionId);
      expect(result.userId).toBe(connection.userId);
      expect(result.bankName).toBe(connection.bankName);
      expect(result.login).toBe(connection.login);
      expect(result.isConnectionActive).toBe(true);
      expect(result.isValidated).toBe(true);
      expect(result.isBankActivationRequired).toBe(false);
      expect(result.isCouldNotConnect).toBe(false);
      expect(result.isSuspended).toBe(false);
    });

    it("should set isConnectionActive to true when status has Active flag", () => {
      const connection: BankConnection = {
        connectionId: "test-id",
        userId: "user-id",
        bankName: "Bank",
        login: "login",
        password: "pass",
        status: BankConnectionStatus.Active,
      };

      const result = toResponseBankConnection(connection);
      expect(result.isConnectionActive).toBe(true);
    });

    it("should set isBankActivationRequired to true when status has flag", () => {
      const connection: BankConnection = {
        connectionId: "test-id",
        userId: "user-id",
        bankName: "Bank",
        login: "login",
        password: "pass",
        status: BankConnectionStatus.BankActivationRequired,
      };

      const result = toResponseBankConnection(connection);
      expect(result.isBankActivationRequired).toBe(true);
    });

    it("should set isCouldNotConnect to true when status has flag", () => {
      const connection: BankConnection = {
        connectionId: "test-id",
        userId: "user-id",
        bankName: "Bank",
        login: "login",
        password: "pass",
        status: BankConnectionStatus.CouldNotConnect,
      };

      const result = toResponseBankConnection(connection);
      expect(result.isCouldNotConnect).toBe(true);
    });

    it("should set isSuspended to true when status has flag", () => {
      const connection: BankConnection = {
        connectionId: "test-id",
        userId: "user-id",
        bankName: "Bank",
        login: "login",
        password: "pass",
        status: BankConnectionStatus.Suspended,
      };

      const result = toResponseBankConnection(connection);
      expect(result.isSuspended).toBe(true);
    });

    it("should set isValidated to true when status has flag", () => {
      const connection: BankConnection = {
        connectionId: "test-id",
        userId: "user-id",
        bankName: "Bank",
        login: "login",
        password: "pass",
        status: BankConnectionStatus.Validated,
      };

      const result = toResponseBankConnection(connection);
      expect(result.isValidated).toBe(true);
    });

    it("should handle combined status flags", () => {
      const connection: BankConnection = {
        connectionId: "test-id",
        userId: "user-id",
        bankName: "Bank",
        login: "login",
        password: "pass",
        status:
          BankConnectionStatus.Active |
          BankConnectionStatus.Validated |
          BankConnectionStatus.Suspended,
      };

      const result = toResponseBankConnection(connection);
      expect(result.isConnectionActive).toBe(true);
      expect(result.isValidated).toBe(true);
      expect(result.isSuspended).toBe(true);
      expect(result.isBankActivationRequired).toBe(false);
      expect(result.isCouldNotConnect).toBe(false);
    });

    it("should handle zero/undefined status", () => {
      const connection: BankConnection = {
        connectionId: "test-id",
        userId: "user-id",
        bankName: "Bank",
        login: "login",
        password: "pass",
        status: 0,
      };

      const result = toResponseBankConnection(connection);
      expect(result.isConnectionActive).toBe(false);
      expect(result.isValidated).toBe(false);
      expect(result.isBankActivationRequired).toBe(false);
      expect(result.isCouldNotConnect).toBe(false);
      expect(result.isSuspended).toBe(false);
    });
  });
});

