import { TransactionPersistanceControllerBase } from './TransactionPersistanceControllerBase';
import { TransactionReadArg } from '@models/transaction/TransactionReadArgs';
import { DatabaseController } from '../DataController';
import { Transaction, TransactionUpdateArgs, TransactionStatus } from '@root/src/models/transaction/Transaction';
import { DatabaseError } from '@root/src/models/errors/errors';
import { transactionPostgresDataController } from './TransactionPostgresController';
import { validateTransactionUpdateArgs, validateTransactionCreateArgs, matchesReadArgs } from './helper';
import moment = require('moment');
import { TransactionDeleteArgs } from '@root/src/routes/request-types/TransactionRequests';

export class TransacitonPersistenceController implements TransactionPersistanceControllerBase {
    private dataController: DatabaseController<Transaction>;

    async update(args: TransactionUpdateArgs): Promise<void> {
        const transaction = await this.read({
            transactionId: args.transactionId,
        });

        if (!transaction) {
            throw new DatabaseError('transaction not found');
        }

        validateTransactionUpdateArgs(args);

        const updateFields: string[] = [];

        if (args.accountId) {
            updateFields.push(`account_id='${args.accountId}'`);
        }

        if (args.categoryId) {
            updateFields.push(`category_id='${args.categoryId}'`);
        }

        if (args.importedDate) {
            updateFields.push(`imported_date='${moment(args.importedDate).toISOString()}'`);
        }

        if (args.overrideCategory) {
            updateFields.push(`override_category_id='${args.overrideCategory}'`);
        }

        if (args.overrideDescription) {
            updateFields.push(`override_description='${args.overrideDescription}'`);
        }

        if (args.overridePostingDate) {
            updateFields.push(`override_posting_date='${moment(args.overridePostingDate).toISOString()}'`);
        }

        if (args.businessId) {
            updateFields.push(`business_id='${args.businessId}'`);
        }

        if (args.processingStatus) {
            updateFields.push(`processing_status=${args.processingStatus}`);
        }

        if (args.serviceType) {
            updateFields.push(`service_type=${args.serviceType}`);
        }

        if (args.transactionStatus) {
            updateFields.push(`transaction_status=${args.transactionStatus}`);
        } else {
            if (args.statusModification === 'hide') {
                args.transactionStatus |= TransactionStatus.hidden;
                updateFields.push(`transaction_status=${args.transactionStatus}`);
            } else if (args.statusModification === 'unhide') {
                args.transactionStatus &= ~TransactionStatus.hidden;
                updateFields.push(`transaction_status=${args.transactionStatus}`);
            }

            if (args.statusModification === 'include') {
                args.transactionStatus &= ~TransactionStatus.excludeFromBalance;
                updateFields.push(`transaction_status=${args.transactionStatus}`);
            } else if (args.statusModification === 'exclude') {
                args.transactionStatus |= TransactionStatus.excludeFromBalance;
                updateFields.push(`transaction_status=${args.transactionStatus}`);
            }
        }

        if (args.userComment) {
            updateFields.push(`user_comment='${args.userComment}'`);
        }

        // if (args.chaseTransaction.CreditCardTransactionType) {
        //     updateFields.push(`credit_card_transaction_type='${args.chaseTransaction.CreditCardTransactionType}'`);
        // }

        // if (args.chaseTransaction.BankDefinedCategory) {
        //     updateFields.push(`bank_defined_transaction='${args.chaseTransaction.BankDefinedCategory}'`);
        // }

        const updateStatement = updateFields.join(',\n');

        this.dataController.update(`
                SET
                    ${updateStatement}
                WHERE 
                    transaction_id='${args.transactionId}';`);
    }

    async add(args: Transaction): Promise<void> {
        validateTransactionCreateArgs(args);

        this.dataController.insert(`
        (
            transaction_id, account_id,
            imported_date, category_id, user_comment,
            override_posting_date, override_description,
            service_type, override_category_id, transaction_status,
            processing_status, details, posting_date, description,
            amount, transaction_type, balance, check_no, business_id,
            credit_card_transaction_type, bank_defined_transaction)
            VALUES (
                '${args.transactionId}',
                '${args.accountId}',
                '${moment().toISOString()}',
                ${args.categoryId ? "'" + args.categoryId + "'" : 'NULL'},
                ${args.userComment ? "'" + args.userComment + "'" : 'NULL'},
                ${args.overridePostingDate ? "'" + moment(args.overridePostingDate).toISOString() + "'" : 'NULL'},
                ${args.overrideDescription ? "'" + args.overrideDescription + "'" : 'NULL'},
                ${args.serviceType ? args.serviceType : 'NULL'},
                ${args.overrideCategory ? "'" + args.overrideCategory + "'" : 'NULL'},
                ${args.transactionStatus ? args.transactionStatus : 'NULL'},
                ${args.processingStatus ? args.processingStatus : 'NULL'},
                ${args.chaseTransaction.Details ? "'" + args.chaseTransaction.Details + "'" : 'NULL'},
                ${
                    args.chaseTransaction.PostingDate
                        ? "'" + moment(args.chaseTransaction.PostingDate).toISOString() + "'"
                        : 'NULL'
                },
                ${args.chaseTransaction.Description ? "'" + args.chaseTransaction.Description + "'" : 'NULL'},
                ${args.chaseTransaction.Amount ? args.chaseTransaction.Amount : 'NULL'},
                ${args.chaseTransaction.Type ? "'" + args.chaseTransaction.Type + "'" : 'NULL'},
                ${args.chaseTransaction.Balance ? args.chaseTransaction.Balance : 'NULL'},
                ${args.chaseTransaction.CheckOrSlip ? "'" + args.chaseTransaction.CheckOrSlip + "'" : 'NULL'},
                ${args.businessId ? "'" + args.businessId + "'" : 'NULL'},
                ${
                    args.chaseTransaction.CreditCardTransactionType
                        ? "'" + args.chaseTransaction.CreditCardTransactionType + "'"
                        : 'NULL'
                },
                ${
                    args.chaseTransaction.BankDefinedCategory
                        ? "'" + args.chaseTransaction.BankDefinedCategory + "'"
                        : 'NULL'
                });`);
    }

    async delete(args: TransactionDeleteArgs): Promise<void> {
        const expression = await matchesReadArgs(args);
        this.dataController.delete(expression).catch((error) => {
            throw error;
        });
    }

    async read(args: TransactionReadArg): Promise<Transaction[] | number> {
        const expression = await matchesReadArgs(args);
        if (args.countOnly) {
            return this.dataController.count(expression).catch((error) => {
                throw error;
            });
        }
        return this.dataController.select(expression).catch((error) => {
            throw error;
        });
    }

    constructor(controller: DatabaseController<Transaction>) {
        this.dataController = controller;
    }
}

export const transactionDatabaseController = new TransacitonPersistenceController(transactionPostgresDataController);
