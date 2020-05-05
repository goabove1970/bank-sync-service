import { TransactionReadArg, SortOrder } from '@models/transaction/TransactionReadArgs';
import { DatabaseError } from '@root/src/models/errors/errors';
import { Transaction } from '@root/src/models/transaction/Transaction';
import { transactionDatabaseController } from './TransacitonPersistenceController';
import moment = require('moment');

export async function matchesReadArgs(args: TransactionReadArg): Promise<string> {
    if (!args) {
        return '';
    }

    const conditions = [];
    if (args.userId) {
        const accounts = await transactionDatabaseController
            .read({
                userId: args.userId,
            })
            .then((accs) =>
                (accs as Transaction[])
                    .map((acc) => acc.accountId)
                    .filter((accid) => accid !== undefined)
                    .map((acc) => `'${acc}'`)
            );

        conditions.push(`account_id in (${accounts.join(', ')})`);
    }

    if (args.accountId) {
        conditions.push(`account_id in ('${args.accountId}')`);
    }

    if (args.accountIds) {
        const expr = args.accountIds.map((e) => `'${e}'`).join(', ');
        conditions.push(`account_id in (${expr})`);
    }

    if (args.categorization) {
        switch (args.categorization) {
            case 'categorized':
                conditions.push('category_id is not NULL');
                break;
            case 'uncategorized':
                conditions.push('category_id is NULL');
                break;
        }
    }

    if (args.userId) {
        conditions.push(`user_id=${!args.userId ? 'NULL' : args.userId}`);
    }

    if (args.transactionId) {
        conditions.push(`transaction_id='${args.transactionId}'`);
    }

    if (args.startDate) {
        conditions.push(`posting_date>=${"'" + moment(args.startDate).toISOString() + "'"}`);
    }

    if (args.endDate) {
        conditions.push(`posting_date<='${moment(args.endDate).toISOString()}'`);
    }

    let finalSattement = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    if (args.order) {
        if ((args.order! as SortOrder) === SortOrder.accending) {
            finalSattement = `${finalSattement} order by posting_date asc`;
        } else {
            finalSattement = `${finalSattement} order by posting_date desc`;
        }
    }

    if (args.readCount) {
        finalSattement = `${finalSattement} limit ${args.readCount}`;
    }

    if (args.offset) {
        finalSattement = `${finalSattement} offset ${args.offset}`;
    }

    return finalSattement;
}

export function validateTransactionUpdateArgs(args: Transaction): void {
    if (!args) {
        throw new DatabaseError('Can not update transaction, no arguments passed');
    }

    if (!args.transactionId) {
        throw new DatabaseError('Can not update transaction, no transactionId passed');
    }
}

export function validateTransactionCreateArgs(args: Transaction): void {
    if (!args) {
        throw new DatabaseError('Can not update transaction, no arguments passed');
    }

    if (!args.transactionId) {
        throw new DatabaseError('Can not update transaction, no transactionId passed');
    }
}
