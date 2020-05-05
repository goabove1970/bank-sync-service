import { UserPersistanceControllerBase } from './UserPersistanceControllerBase';
import { DeepPartial } from '@models/DeepPartial';
import { UserUpdatePasswordArgs, UserLoginArgs } from '@models/user/UserUpdatePasswordArgs';
import { UserDeleteArgs } from '@models/user/UserDeleteArgs';
import { ManageAccountArgs } from '@models/user/ManageAccountArgs';
import { UserReadArgs } from '@models/user/UserReadArgs';
import { UserCreateArgs } from '@models/user/UserCreateArgs';
import { UserUpdateArgs } from '@models/user/UserUpdateArgs';
import * as passwordHash from 'password-hash';
import {
  validateCreateUserArgs,
  combineNewUser,
  validateUserUpdatePasswordArgs,
  validateUserUpdateArgs,
  toShortUserDetails,
  matchesReadArgs,
} from './helper';
import { UserDetails } from '@models/user/UserDetails';
import { UserStatus } from '@models/user/UserStatus';
import { DatabaseController } from '../DataController';
import { userPostgresDataController } from './UsersPostgresController';
import { accountPersistanceController } from '../account/AccountPersistanceController';
import { userAccountLinkDataController } from '../userAccountLink/UserAccountLinkPostgresController';
import moment = require('moment');
import { Value } from 'ts-postgres';
import { UserAccountLink } from '@root/src/models/accounts/Account';
import { DatabaseError } from '@root/src/models/errors';

export class UserPersistanceController implements UserPersistanceControllerBase {
  private dataController: DatabaseController<UserDetails>;

  constructor(controller: DatabaseController<UserDetails>) {
    this.dataController = controller;
  }

  checkLoginAvailable(login: string): Promise<void> {
    const condition = `WHERE login='${login}'`;

    return this.dataController
      .select(condition)
      .then((collection) => {
        if (collection && collection.length > 0) {
          throw new DatabaseError('User with this login already exists');
        }
      })
      .catch((error) => {
        throw error;
      });
  }

  private findUserImpl(userId: string): Promise<UserDetails | undefined> {
    const condition = `WHERE "userId"='${userId}'`;

    return this.dataController
      .select(condition)
      .then((collection) => {
        if (collection && collection.length > 0) {
          return collection[0];
        }
        return undefined;
      })
      .catch((error) => {
        throw error;
      });
  }

  getUserById(userId: string): Promise<DeepPartial<UserDetails> | undefined> {
    return this.findUserImpl(userId)
      .then((user) => {
        if (!user) {
          return undefined;
        }
        return toShortUserDetails(user);
      })
      .catch((error) => {
        throw error;
      });
  }

  read(args: UserReadArgs): Promise<DeepPartial<UserDetails>[]> {
    return this.dataController
      .select(matchesReadArgs(args))
      .then((c) => c.map(toShortUserDetails))
      .catch((error) => {
        throw error;
      });
  }

  private getUserByStringCondition(condition?: string): Promise<UserDetails | undefined> {
    return this.dataController
      .select(condition)
      .then((collection) => {
        if (collection && collection.length > 0) {
          return collection[0];
        }
        return undefined;
      })
      .then((user) => {
        if (!user) {
          return undefined;
        }
        //return toShortUserDetails(user);
        return user;
      })
      .catch((error) => {
        throw error;
      });
  }

  getUserByLogin(login?: string): Promise<UserDetails | undefined> {
    return this.getUserByStringCondition(`WHERE login='${login}'`);
  }

  getUserByEmail(email?: string): Promise<UserDetails | undefined> {
    return this.getUserByStringCondition(`WHERE email='${email}'`);
  }

  create(args: UserCreateArgs): Promise<string> {
    validateCreateUserArgs(args);
    const u = combineNewUser(args);
    return this.checkLoginAvailable(args.login)
      .then(() => {
        const query = `(
                    "userId", "firstName", "lastName", ssn,
                    login, password, email, dob,
                    "lastLogin",
                    "accountCreated", "serviceComment", status)
                VALUES (
                    '${u.userId}', '${u.firstName}', '${u.lastName}', ${u.ssn},
                    '${u.login}', '${u.password}', '${u.email}', '${moment(u.dob).toISOString()}',
                    ${!u.lastLogin ? 'NULL' : "'" + moment(u.lastLogin!).toISOString() + "'"},
                    '${moment(u.accountCreated).toISOString()}',
                    ${!u.serviceComment ? 'NULL' : "'" + u.serviceComment! + "'"}, 
                    ${!u.status ? 'NULL' : u.status});`;
        return this.dataController.insert(query);
      })
      .then(() => {
        return u.userId;
      })
      .catch((error) => {
        throw error;
      });
  }

  private composeSetStatement(user: UserDetails): string {
    return `SET
                "firstName"='${user.firstName}',
                "lastName"='${user.lastName}',
                ssn=${user.ssn},
                login='${user.login}',
                password='${user.password}',
                email='${user.email}',
                dob='${moment(user.dob).toISOString()}',
                "lastLogin"=${user.lastLogin ? "'" + moment(user.lastLogin).toISOString() + "'" : 'NULL'},
                "accountCreated"='${moment(user.accountCreated).toISOString()}',
                "serviceComment"=${user.serviceComment ? "'" + user.serviceComment + "'" : 'NULL'},
                status=${user.status ? user.status : 'NULL'}
            WHERE 
                "userId"='${user.userId}';`;
  }

  updatePassword(args: UserUpdatePasswordArgs): Promise<void> {
    validateUserUpdatePasswordArgs(args);

    const { userId, oldPassword, newPassword } = args;
    return this.findUserImpl(userId)
      .then((user: UserDetails) => {
        if (!user) {
          throw new DatabaseError('Error updating user password, user not found');
        }
        if (!(user.status & UserStatus.Active)) {
          throw new DatabaseError('Error updating user password, user account is inactive');
        }
        const verified = passwordHash.verify(oldPassword, user.password);
        if (!verified) {
          throw new DatabaseError('Error updating user password, old password could not be verified');
        }
        const newHash = passwordHash.generate(newPassword);
        user.password = newHash;
        return user;
      })
      .then((user) => {
        this.dataController.update(this.composeSetStatement(user));
      })
      .catch((error) => {
        throw error;
      });
  }

  validtePassword(args: UserLoginArgs): Promise<UserDetails | undefined> {
    const { login, password } = args;
    return this.getUserByLogin(login)
      .then((user: UserDetails) => {
        if (!user) {
          throw new DatabaseError('Error validating user password, user not found');
        }
        // we store hash, not the actual password
        if (passwordHash.verify(password, user.password)) {
          return user;
        }
        return undefined;
      })
      .catch((error) => {
        throw error;
      });
  }

  updateUserData(args: UserUpdateArgs): Promise<void> {
    validateUserUpdateArgs(args);
    return this.findUserImpl(args.userId)
      .then((user) => {
        if (!user) {
          throw new DatabaseError('Error updating user data, could not find user record');
        }
        if (!(user.status & UserStatus.Active) && !args.forceUpdate) {
          throw new DatabaseError('Error updating user data, user account is inactive');
        }

        if (args.lastName) {
          user.lastName = args.lastName;
        }
        if (args.dob) {
          user.dob = args.dob;
        }
        if (args.email) {
          user.email = args.email;
        }
        if (args.firstName) {
          user.firstName = args.firstName;
        }
        if (args.ssn) {
          user.ssn = args.ssn;
        }
        if (args.status) {
          user.status = args.status;
        }
        return user;
      })
      .then((user) => {
        this.dataController.update(this.composeSetStatement(user));
      })
      .catch((error) => {
        throw error;
      });
  }

  updateLastLogin(userId: string): Promise<void> {
    return this.findUserImpl(userId)
      .then((user) => {
        if (!user) {
          throw new DatabaseError('Error updating user last login, could not find user record');
        }
        user.lastLogin = moment().toDate();
        return user;
      })
      .then((user) => {
        this.dataController.update(this.composeSetStatement(user));
      })
      .catch((error) => {
        throw error;
      });
  }

  delete(args: UserDeleteArgs): Promise<void> {
    const { userId, serviceComment, deleteRecord } = args;

    return this.findUserImpl(userId)
      .then((user) => {
        if (!user) {
          throw new DatabaseError('Error deleting user, could not find user record');
        }
        if (deleteRecord) {
          return this.dataController.delete(`where "userId"='${userId}'`).then(() => {});
        } else {
          user.serviceComment = user.serviceComment + `; ${serviceComment}`;
          user.status = user.status & UserStatus.Deactivated;
          return this.dataController.update(this.composeSetStatement(user)).then(() => {});
        }
      })
      .catch((error) => {
        throw error;
      });
  }

  addAccount(args: ManageAccountArgs): Promise<void> {
    const { userId, accountId } = args;
    return this.findUserImpl(userId)
      .then((user) => {
        if (!user) {
          throw new DatabaseError('Could not find user record to link account to user');
        }
      })
      .then(() => {
        return accountPersistanceController.read({
          accountId,
        });
      })
      .then((account) => {
        if (!account) {
          throw new DatabaseError('Could not find account record to link account to user');
        }
      })
      .then(() => {
        return userAccountLinkDataController.count(`
                WHERE
                    user_id='${userId}'
                    AND account_id='${accountId}'`);
      })
      .then((count) => {
        if (count > 0) {
          throw new DatabaseError('This account has been already linked to this user');
        }
      })
      .then(() => {
        userAccountLinkDataController.insert(`(
                    user_id, account_id)
                    VALUES (
                        '${userId}',
                        '${accountId}');`);
      });
  }

  removeAccount(args: ManageAccountArgs): Promise<void> {
    const { userId, accountId } = args;
    return this.findUserImpl(userId)
      .then((user) => {
        if (!user) {
          throw new DatabaseError('Could not find user record to unlink account to user');
        }
      })
      .then(() => {
        return accountPersistanceController.read({
          accountId,
        });
      })
      .then((account) => {
        if (!account) {
          throw new DatabaseError('Could not find account record to unlink account to user');
        }
      })
      .then(() => {
        return userAccountLinkDataController.count(`
                WHERE
                    user_id='${userId}'
                    AND account_id='${accountId}'`);
      })
      .then((count) => {
        if (count === 0) {
          throw new DatabaseError('This account has been already unlinked from this user');
        }
      })
      .then(() => {
        userAccountLinkDataController.delete(`
                    WHERE
                        user_id='${userId}'
                        AND account_id='${accountId}';`);
      });
  }

  getUserAccountLinks(args: ManageAccountArgs): Promise<UserAccountLink[]> {
    const { userId } = args;
    return this.findUserImpl(userId)
      .then((user) => {
        if (!user) {
          throw new DatabaseError('Could not find user record to unlink account to user');
        }
      })
      .then(() => {
        return userAccountLinkDataController.select(`
                WHERE
                    user_id='${userId}'`);
      });
  }

  readUserAccountResponse(values: Value[][]): string[] {
    const collection: string[] = [];
    values.forEach((row) => {
      collection.push(row[1] as string);
    });
    return collection;
  }
}

export const userPersistanceController = new UserPersistanceController(userPostgresDataController);
