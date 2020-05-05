import { UserUpdatePasswordArgs, UserLoginArgs } from '@models/user/UserUpdatePasswordArgs';
import { UserDeleteArgs } from '@models/user/UserDeleteArgs';
import { ManageAccountArgs } from '@models/user/ManageAccountArgs';
import { UserReadArgs } from '@models/user/UserReadArgs';
import { UserCreateArgs } from '@models/user/UserCreateArgs';
import { UserUpdateArgs } from '@models/user/UserUpdateArgs';
import { DeepPartial } from '@models/DeepPartial';
import { UserDetails } from '@models/user/UserDetails';
import { userPersistanceController } from '../data-controller/users/UserPersistanceController';
import { UserPersistanceControllerBase } from '../data-controller/users/UserPersistanceControllerBase';
import { UserAccountLink } from '@root/src/models/accounts/Account';

export class UserController implements UserPersistanceControllerBase {
    removeAccount(args: ManageAccountArgs): Promise<void> {
        return userPersistanceController.removeAccount(args);
    }
    getUserByEmail(email: string): Promise<DeepPartial<UserDetails> | undefined> {
        return userPersistanceController.getUserByEmail(email);
    }

    read(args: UserReadArgs): Promise<DeepPartial<UserDetails>[]> {
        return userPersistanceController.read(args);
    }

    getUserById(userId: string): Promise<DeepPartial<UserDetails> | undefined> {
        return userPersistanceController.getUserById(userId);
    }

    getUserByLogin(login: string): Promise<DeepPartial<UserDetails> | undefined> {
        return userPersistanceController.getUserByLogin(login);
    }

    create(args: UserCreateArgs): Promise<string> {
        return userPersistanceController.create(args);
    }

    addAccount(args: ManageAccountArgs): Promise<void> {
        return userPersistanceController.addAccount(args);
    }

    validateUser(args: UserLoginArgs): Promise<UserDetails | undefined> {
        return userPersistanceController.validtePassword(args);
    }

    getUserAccountLinks(args: ManageAccountArgs): Promise<UserAccountLink[]> {
        return userPersistanceController.getUserAccountLinks(args);
    }

    updatePassword(args: UserUpdatePasswordArgs): Promise<void> {
        return userPersistanceController.updatePassword(args);
    }

    updateUserData(args: UserUpdateArgs): Promise<void> {
        return userPersistanceController.updateUserData(args);
    }

    updateLastLogin(userId: string): Promise<void> {
        return userPersistanceController.updateLastLogin(userId);
    }

    delete(args: UserDeleteArgs): Promise<void> {
        return userPersistanceController.delete(args);
    }
}

const userController: UserController = new UserController();
export default userController;
