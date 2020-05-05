import * as passwordHash from 'password-hash';
import { UserUpdatePasswordArgs } from '@models/user/UserUpdatePasswordArgs';
import { UserReadArgs } from '@models/user/UserReadArgs';
import { UserCreateArgs } from '@models/user/UserCreateArgs';
import { UserUpdateArgs } from '@models/user/UserUpdateArgs';
import { GuidFull } from '@utils/generateGuid';
import { DeepPartial } from '@models/DeepPartial';
import { UserDetails } from '@models/user/UserDetails';
import { UserStatus } from '@models/user/UserStatus';

export function validateCreateUserArgs(args: UserCreateArgs): void {
    if (!args.firstName) {
        throw {
            message: 'User first name can not be empty',
        };
    }

    if (!args.lastName) {
        throw {
            message: 'User last name can not be empty',
        };
    }

    if (!args.dob) {
        throw {
            message: 'User birth date can not be empty',
        };
    }

    if (!args.email) {
        throw {
            message: 'User email can not be empty',
        };
    }

    validateNewPassword(args.password);

    if (!args.ssn) {
        throw {
            message: 'User SSN can not be empty',
        };
    }
}

export function validateNewPassword(password?: string) {
    if (!password) {
        throw {
            message: 'User password can not be empty',
        };
    }

    if (password.length < 8) {
        throw {
            message: 'Password can not be less than 8 characters',
        };
    }
}

export function validateUserUpdatePasswordArgs(args: UserUpdatePasswordArgs): void {
    validateNewPassword(args.newPassword);

    if (!args.userId) {
        throw {
            message: 'Could not update password, user id is not specified.',
        };
    }

    if (!args.oldPassword) {
        throw {
            message: 'Could not update password, old password is not specified.',
        };
    }

    if (!args.newPassword) {
        throw {
            message: 'Could not update password, new password is not specified.',
        };
    }
}

export const toShortUserDetails = (user: UserDetails): DeepPartial<UserDetails> => {
    if (!user) {
        return undefined;
    }
    return {
        userId: user.userId,
        login: user.login,
        firstName: user.firstName,
        lastName: user.lastName,
        dob: user.dob,
        ssn: user.ssn,
        serviceComment: user.serviceComment,
        status: user.status,
        email: user.email,
        accountCreated: user.accountCreated,
    };
};

export const combineNewUser = (args: UserCreateArgs): UserDetails => {
    return {
        accountCreated: new Date(),
        dob: args.dob,
        email: args.email,
        firstName: args.firstName,
        lastName: args.lastName,
        login: args.login,
        lastLogin: undefined,
        password: passwordHash.generate(args.password),
        ssn: args.ssn,
        userId: GuidFull(),
        status: UserStatus.ActivationPending,
    };
};

export function matchesReadArgs(args: UserReadArgs): string {
    if (!args) {
        return '';
    }

    const conditions = [];
    if (args.status) {
        conditions.push(`((status & ${args.status})=${args.status})`);
    }

    const finalSattement = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    return finalSattement;
}

export function validateUserUpdateArgs(args: UserUpdateArgs): void {
    if (!args) {
        throw {
            message: 'Can not update user, no arguments passed',
        };
    }

    if (!args.userId) {
        throw {
            message: 'Can not update user, no userId passed',
        };
    }
}
