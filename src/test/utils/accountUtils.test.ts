import { AccountType } from "@models/accounts/Account";
import { isCreditAccountType } from "@utils/accountUtils";

describe("accountUtils", () => {
  describe("isCreditAccountType", () => {
    it("should return true for Credit account type", () => {
      expect(isCreditAccountType(AccountType.Credit)).toBe(true);
    });

    it("should return false for Debit account type", () => {
      expect(isCreditAccountType(AccountType.Debit)).toBe(false);
    });

    it("should return false for Checking account type", () => {
      expect(isCreditAccountType(AccountType.Checking)).toBe(false);
    });

    it("should return false for null/undefined", () => {
      expect(isCreditAccountType(null as any)).toBe(false);
      expect(isCreditAccountType(undefined as any)).toBe(false);
    });

    it("should return false for combined Debit and Checking", () => {
      const combined = AccountType.Debit | AccountType.Checking;
      expect(isCreditAccountType(combined)).toBe(false);
    });

    it("should return true for combined Credit and other types", () => {
      const combined = AccountType.Credit | AccountType.Debit;
      expect(isCreditAccountType(combined)).toBe(true);
    });
  });
});

