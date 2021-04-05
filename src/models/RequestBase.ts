import { AccountResponseModel } from "../controllers/data-controller/account/AccountResponseModel";
import { AccountCreateArgs } from "./accounts/AccountCreateArgs";
import { AccountRequestType } from "./accounts/AccountRequestType";
import { AccountUpdateArgs } from "./accounts/AccountUpdateArgs";
import { ReadAccountArgs } from "./accounts/ReadAccountArgs";

export class AccountRequestBase {
    action?: AccountRequestType;
    args?: ReadAccountArgs & AccountCreateArgs & AccountUpdateArgs;
}

export class AccountResponseBase {
    action?: AccountRequestType;
    payload?: {
        accounts?: AccountResponseModel[],
        count: number

    };
    error: string;
}
