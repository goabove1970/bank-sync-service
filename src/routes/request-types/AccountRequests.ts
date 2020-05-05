import { ResponseBase } from './Requests';
import { ReadAccountArgs } from '@models/accounts/ReadAccountArgs';
import { AccountCreateArgs } from '@models/accounts/AccountCreateArgs';
import { AccountUpdateArgs } from '@models/accounts/AccountUpdateArgs';
import { AccountDeleteArgs } from '@models/accounts/AccountDeleteArgs';

export type AccountRequestType = 'read-accounts' | 'create-account' | 'delete-account' | 'update';

export interface AccountRequest {
  action?: AccountRequestType;
  args?: ReadAccountArgs & AccountCreateArgs & AccountUpdateArgs & AccountDeleteArgs;
}

export interface AccountResponse extends ResponseBase {
  action?: AccountRequestType;
}
