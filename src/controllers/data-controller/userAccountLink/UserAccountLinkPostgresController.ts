import { DatabaseController } from '../DataController';
import { Value } from 'ts-postgres';
import { UserAccountLink } from '@root/src/models/accounts/Account';

export class UserAccountLinkPostgresController extends DatabaseController<UserAccountLink> {
    readSelectResponse(values: Value[][]): UserAccountLink[] {
        const collection: UserAccountLink[] = [];
        values.forEach((row) => {
            collection.push({
                userId: row[0],
                accountId: row[1],
            } as UserAccountLink);
        });

        return collection;
    }
    constructor() {
        super('user_account');
    }
}

export const userAccountLinkDataController: DatabaseController<
    UserAccountLink
> = new UserAccountLinkPostgresController();
