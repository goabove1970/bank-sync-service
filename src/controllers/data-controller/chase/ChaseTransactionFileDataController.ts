import { FileController } from '@controllers/data-controller/FileController';
import { ChaseTransactionParser } from '@controllers/parser-controller/chase/ChaseTransactionParser';
import { ChaseTransaction } from '@models/transaction/chase/ChaseTransaction';

export const chaseTransactionParser: ChaseTransactionParser = new ChaseTransactionParser();

export class ChaseTransactionFileDataController extends FileController<ChaseTransaction> {
  constructor(filename: string) {
    super(filename, chaseTransactionParser);
  }
}
