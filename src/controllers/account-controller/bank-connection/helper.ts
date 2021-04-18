import { BankSyncArgs } from '@root/src/routes/connections-request';
import { DatabaseError } from '@root/src/models/errors';

export async function matchesReadArgs(args: BankSyncArgs): Promise<string> {
  if (!args) {
    return '';
  }

  const conditions = [];
  if (args.connectionId) {
    conditions.push(`connection_id = '${args.connectionId}'`);
  }

  if (args.userId) {
    conditions.push(`user_id = '${args.userId}'`);
  }

  let finalSattement = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  return finalSattement;
}

export function validateConnectionUpdateArgs(args: BankSyncArgs): void {
  if (!args) {
    throw new DatabaseError('Can not update connection, no arguments passed');
  }

  if (!args.connectionId) {
    throw new DatabaseError('Can not update connection, no connectionId passed');
  }
}

export function validateConnectionCreateArgs(args: BankSyncArgs): void {
  if (!args) {
    throw new DatabaseError('Can not create connection, no arguments passed');
  }

  if (!args.connectionId) {
    throw new DatabaseError('Can not create connection, no connectionId passed');
  }

  if (!args.userId) {
    throw new DatabaseError('Can not create connection, no userId passed');
  }

  if (!args.login) {
    throw new DatabaseError('Can not create connection, no login passed');
  }

  if (!args.password) {
    throw new DatabaseError('Can not create connection, no password passed');
  }

  if (!args.bankName) {
    throw new DatabaseError('Can not create connection, no bankName passed');
  }
}
