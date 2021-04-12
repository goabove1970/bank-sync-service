import { AccountResponseModel } from "../controllers/account-controller/AccountResponseModel";
import { AccountCreateArgs } from "./accounts/AccountCreateArgs";
import { AccountRequestType } from "./accounts/AccountRequestType";
import { AccountUpdateArgs } from "./accounts/AccountUpdateArgs";
import { ReadAccountArgs } from "./accounts/ReadAccountArgs";
import { Transaction } from "./transaction/Transaction";

export class RequestBase {
    action?: string;
    args?: {} | AddTransactionsArgs;
}

export class AddTransactionsArgs {
    transactions?: Transaction[];
    accountId?: string;
}

export class ResponseBase {
    action?: string;
    payload?: {};
    error?: string;
}

export class AccountRequestBase extends RequestBase {
    action?: AccountRequestType;
    args?: ReadAccountArgs & AccountCreateArgs & AccountUpdateArgs;
}

export class AccountResponseBase extends ResponseBase {
    action?: AccountRequestType;
    payload?: {
        accounts?: AccountResponseModel[],
        count?: number,
        accountId?: string
    };
}
