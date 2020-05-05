import { DeepPartial } from '@models/DeepPartial';
import { UserUpdatePasswordArgs } from '@models/user/UserUpdatePasswordArgs';
import { UserReadArgs } from '@models/user/UserReadArgs';
import { UserCreateArgs } from '@models/user/UserCreateArgs';
import { UserUpdateArgs } from '@models/user/UserUpdateArgs';
import { UserDetails } from '@models/user/UserDetails';
import { ManageAccountArgs } from '@root/src/models/user/ManageAccountArgs';

export abstract class UserPersistanceControllerReadonlyBase {
    abstract getUserById(userId: string): Promise<DeepPartial<UserDetails> | undefined>;
    abstract read(args: UserReadArgs): Promise<DeepPartial<UserDetails>[]>;
    abstract getUserByLogin(login?: string): Promise<DeepPartial<UserDetails> | undefined>;
    abstract getUserByEmail(email?: string): Promise<DeepPartial<UserDetails> | undefined>;
}

export abstract class UserPersistanceControllerBase extends UserPersistanceControllerReadonlyBase {
    abstract create(user: UserCreateArgs): Promise<string>;
    abstract updatePassword(args: UserUpdatePasswordArgs): Promise<void>;
    abstract updateUserData(args: UserUpdateArgs): Promise<void>;
    abstract addAccount(args: ManageAccountArgs): Promise<void>;
    abstract removeAccount(args: ManageAccountArgs): Promise<void>;
}
