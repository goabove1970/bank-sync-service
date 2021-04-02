import { BankConnectionPersistanceControllerBase } from './BankConnectionPersistanceControllerBase';
import { DatabaseController } from '../DataController';
import { bankConnectionsPostgresDataController } from './BankConnectionPostgresController';
import moment = require('moment');
import { BankConnection } from '@root/src/models/bank-connection';
import { BankSyncArgs } from '@root/src/routes/connections-request';
import { validateConnectionUpdateArgs, validateConnectionCreateArgs, matchesReadArgs } from './helper';
import { DatabaseError } from '@root/src/models/errors';

export class BankConnectionPersistenceController implements BankConnectionPersistanceControllerBase {
  private dataController: DatabaseController<BankConnection>;

  constructor(controller: DatabaseController<BankConnection>) {
    this.dataController = controller;
  }

  async update(args: BankSyncArgs): Promise<void> {
    const session = await this.read(args);

    if (!session) {
      throw new DatabaseError('session not found');
    }

    validateConnectionUpdateArgs(args);

    const updateFields: string[] = [];

    if (args.login) {
      updateFields.push(`login='${args.login}'`);
    }
    if (args.password) {
      updateFields.push(`password='${args.password}'`);
    }
    if (args.status) {
      updateFields.push(`status=${args.status}`);
    }

    if (args.lastPollDate) {
      updateFields.push(`last_poll_date='${moment(args.lastPollDate).toISOString()}'`);
    }

    if (args.lastPollStats) {
      updateFields.push(`last_polls_stats='${escape(JSON.stringify(args.lastPollStats))}'`);
    }

    const updateStatement = updateFields.join(',\n');

    this.dataController.update(`
                SET
                    ${updateStatement}
                WHERE 
                    connection_id='${args.connectionId}';`);
  }

  async add(args: BankConnection): Promise<void> {
    validateConnectionCreateArgs(args);

    this.dataController.insert(`
        (connection_id,
         user_id,
         bank_name,
         "login",
         "password",
         date_added,
         status,
         last_poll_date,
         last_polls_stats)
        VALUES (
            '${args.connectionId}',
            '${args.userId}',
            '${args.bankName}',
            '${args.login}',
            '${args.password}',
            '${moment(args.dateAdded).toISOString()}',
            ${args.status ? args.status : 'NULL'},
            ${args.lastPollDate ? `'${moment(args.lastPollDate).toISOString()}'` : 'NULL'},
            ${args.lastPollStats ? `'${args.lastPollStats}'` : 'NULL'});`);
  }

  async delete(args: BankSyncArgs): Promise<void> {
    const expression = await matchesReadArgs(args);
    this.dataController.delete(expression).catch((error) => {
      throw error;
    });
  }

  async read(args: BankSyncArgs): Promise<BankConnection[]> {
    const expression = await matchesReadArgs(args);

    return this.dataController.select(expression).catch((error) => {
      throw error;
    });
  }
}

export const bankConnectionDatabaseController = new BankConnectionPersistenceController(
  bankConnectionsPostgresDataController
);
