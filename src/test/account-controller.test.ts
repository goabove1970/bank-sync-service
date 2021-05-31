import { AccountCreateArgs } from "@models/accounts/AccountCreateArgs";
import { ReadAccountArgs } from "@models/accounts/ReadAccountArgs";
import { AccountController } from "../controllers/account-controller/account-controller";
import {
  mockableAccountArgs,
  MockAccountController,
} from "./mock/MockAccountController";

describe("AccountController", () => {
  let mockAccountController: AccountController;

  beforeEach(() => {
    mockAccountController = new MockAccountController();
  });

  it(`should create account`, async () => {
    const createAccountArgs: AccountCreateArgs = {
      bankAccountNumber: "acc_num",
      bankName: "bank_name",
      userId: "user_id",
      bankRoutingNumber: "bank_routing",
    };

    mockableAccountArgs.mockAccountCollection = [];

    const acct_id = await mockAccountController.create(createAccountArgs);
    expect(acct_id).not.toBeNull();
    expect(acct_id.length).toBeGreaterThan(0);

    const indexOf = mockableAccountArgs.mockAccountCollection.find(
      (acct) => acct.accountId === acct_id
    );
    expect(indexOf).not.toEqual(-1);

    expect(mockableAccountArgs.mockAccountCollection.length).toBeGreaterThan(0);
  });

  it(`should read by account id`, async () => {
    const createAccountArgs: AccountCreateArgs = {
      bankAccountNumber: "acc_num",
      bankName: "bank_name",
      userId: "user_id",
      bankRoutingNumber: "bank_routing",
    };
    mockableAccountArgs.mockAccountCollection = [];

    const acct_id = await mockAccountController.create(createAccountArgs);
    const readAccountArgs: ReadAccountArgs = {
      accountId: acct_id,
    };
    const user = mockAccountController.read(readAccountArgs);
    expect(user).not.toBeNull();
  });

  it(`should read by user id`, async () => {
    const createAccountArgs: AccountCreateArgs = {
      bankAccountNumber: "acc_num",
      bankName: "bank_name",
      userId: "user_id",
      bankRoutingNumber: "bank_routing",
    };
    mockableAccountArgs.mockAccountCollection = [];

    await mockAccountController.create(createAccountArgs);
    const readAccountArgs: ReadAccountArgs = {
      userId: createAccountArgs.userId,
    };
    const user = mockAccountController.read(readAccountArgs);
    expect(user).not.toBeNull();
  });
});
