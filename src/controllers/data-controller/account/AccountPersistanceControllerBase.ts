import { DeepPartial } from '@models/DeepPartial';
import { UserAccount } from '@models/accounts/Account';
import { ReadAccountArgs } from '@models/accounts/ReadAccountArgs';
import { AccountCreateArgs } from '@models/accounts/AccountCreateArgs';
import { AccountUpdateArgs } from '@models/accounts/AccountUpdateArgs';
import { AccountDeleteArgs } from '@models/accounts/AccountDeleteArgs';

export abstract class AccountPersistanceControllerReadonlyBase {
    abstract read(args: ReadAccountArgs): Promise<DeepPartial<UserAccount>[]>;
}

export abstract class AccountPersistanceControllerBase extends AccountPersistanceControllerReadonlyBase {
    abstract create(args: AccountCreateArgs): Promise<string>;
    abstract update(args: AccountUpdateArgs): Promise<void>;
    abstract delete(args: AccountDeleteArgs): Promise<void>;
}
