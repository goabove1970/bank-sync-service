import { AccountStatus } from '@models/accounts/AccountStatus';
export interface ReadAccountArgs {
    userId?: string;
    status?: AccountStatus;
    accountId?: string;
}
