import { DatabaseController } from '../DataController';
import { Value } from 'ts-postgres';
import { UserAccount } from '@root/src/models/accounts/Account';

export class AccountPostgresController extends DatabaseController<UserAccount> {
  constructor() {
    super('account');
  }

  readSelectResponse(values: Value[][]): UserAccount[] {
    const collection: UserAccount[] = [];
    values.forEach((row) => {
      collection.push({
        accountId: row[0],
        bankName: row[1],
        createDate: row[2],
        status: row[3],
        serviceComment: row[4],
        accountType: row[5],
        cardNumber: row[6],
        cardExpiration: row[7],
        alias: row[8],
        bankRoutingNumber: row[9],
        bankAccountNumber: row[10],
      } as UserAccount);
    });

    return collection;
  }
}

export const accountPostgresDataController: DatabaseController<UserAccount> = new AccountPostgresController();
