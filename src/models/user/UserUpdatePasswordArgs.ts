export interface UserLoginArgs {
    login: string;
    password: string;
}

export interface UserExtendSessionArgs {
    sessionId: string;
}

export interface UserLogoutArgs {
    sessionId: string;
}

export interface UserUpdatePasswordArgs {
    userId: string;
    oldPassword: string;
    newPassword: string;
}
