import { DatabaseController } from '../../../models/database/DataController';
import { Value } from 'ts-postgres';
import { BankConnection } from '@root/src/models/bank-connection';
import { BankConnectionStats } from '@root/src/models/bank-connection-stats';
import logger from '@root/src/logger';
import { inspect } from 'util';

export class BankConnectionsPostgresController extends DatabaseController<
  BankConnection
> {
  constructor() {
    super('bank_connections');
  }

  readSelectResponse(values: Value[][]): BankConnection[] {
    const collections: BankConnection[] = [];
    values.forEach((valueRow) => {
      const pollstats = valueRow[8] as string | undefined;
      let stats: BankConnectionStats | undefined = undefined;
      if (pollstats) {
        try {
          stats = JSON.parse(unescape(pollstats));
        } catch (error) {
          logger.error(inspect(error));
        }
      }

      collections.push({
        connectionId: valueRow[0],
        userId: valueRow[1],
        bankName: valueRow[2],
        login: valueRow[3],
        password: valueRow[4],
        dateAdded: valueRow[5],
        status: valueRow[6],
        lastPollDate: valueRow[7],
        lastPollStats: stats,
      } as BankConnection);
    });

    return collections;
  }
}

export const bankConnectionsPostgresDataController: DatabaseController<
  BankConnection
> = new BankConnectionsPostgresController();
