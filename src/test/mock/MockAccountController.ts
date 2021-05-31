import { AccountController } from "@root/src/controllers/account-controller/account-controller";
import { AccountResponseModel } from "@root/src/controllers/account-controller/AccountResponseModel";
import { UserAccount } from "@root/src/models/accounts/Account";
import { AccountCreateArgs } from "@root/src/models/accounts/AccountCreateArgs";
import { AccountUpdateArgs } from "@root/src/models/accounts/AccountUpdateArgs";
import { ReadAccountArgs } from "@root/src/models/accounts/ReadAccountArgs";
import { GuidFull } from "@root/src/utils/generateGuid";
import "jest";

export const mockableAccountArgs: { mockAccountCollection: UserAccount[] } = {
  mockAccountCollection: [],
};

const getCollection: () => UserAccount[] = () => {
  return mockableAccountArgs.mockAccountCollection;
};

const updateItem = (item: UserAccount) => {
  const index = getCollection().findIndex(
    (e) => e.accountId === item.accountId
  );
  if (index !== -1) {
    getCollection()[index] = item;
  }
};

const addItem = (item: UserAccount) => {
  getCollection().push(item);
};

const MockRead = jest.fn(
  (args: ReadAccountArgs): Promise<AccountResponseModel[]> => {
    let subset = getCollection();
    if (args.accountId) {
      subset = subset.filter((d) => d.accountId === args.accountId);
    }
    if (args.userId) {
      subset = subset.filter((d) => d.userId === args.userId);
    }
    return Promise.resolve(subset);
  }
);

const MockCreate = jest.fn(
  (args: AccountCreateArgs): Promise<string> => {
    const acct: UserAccount = {
      accountType: args.accountType,
      userId: args.userId,
      bankRoutingNumber: args.bankRoutingNumber,
      bankAccountNumber: args.bankAccountNumber,
      bankName: args.bankName,
      serviceComment: args.serviceComment,
      alias: args.alias,
      cardNumber: args.cardNumber,
      accountId: GuidFull(),
    };
    addItem(acct);
    return Promise.resolve(acct.accountId);
  }
);
const MockAssignUser = jest.fn(
  (userId: string, accountId: string): Promise<void> => {
    throw "Not implemented";
  }
);
const MockUpdate = jest.fn(
  (args: AccountUpdateArgs): Promise<void> => {
    return Promise.resolve(updateItem(args));
  }
);

export const MockAccountController = jest.fn<AccountController, []>(() => ({
  config: {},
  routerName: "",
  create: MockCreate,
  read: MockRead,
  update: MockUpdate,
  assignUser: MockAssignUser,
}));
