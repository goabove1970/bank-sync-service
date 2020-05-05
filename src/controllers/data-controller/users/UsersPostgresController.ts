import { DatabaseController } from '../DataController';
import { Value } from 'ts-postgres';
import { UserDetails } from '@root/src/models/user/UserDetails';

export class UserPostgresController extends DatabaseController<UserDetails> {
    constructor() {
        super('users');
    }

    readSelectResponse(values: Value[][]): UserDetails[] {
        const collection: UserDetails[] = [];
        values.forEach((row) => {
            collection.push({
                userId: row[0],
                firstName: row[1],
                lastName: row[2],
                ssn: row[3],
                login: row[4],
                password: row[5],
                email: row[6],
                dob: row[7],
                lastLogin: row[8],
                accountCreated: row[9],
                serviceComment: row[10],
                status: row[11],
            } as UserDetails);
        });

        return collection;
    }
}

export const userPostgresDataController: DatabaseController<UserDetails> = new UserPostgresController();
