import { BankSyncArgs } from '../../routes/connections-request';
import { bankConnectionDatabaseController } from '../data-controller/session/BankConnectionPersistenceController';
import { BankConnection } from '../../models/bank-connection';

export class BankConnectionController {
  update(args: BankSyncArgs): Promise<void> {
    return bankConnectionDatabaseController.update(args);
  }

  delete(args: BankSyncArgs): Promise<void> {
    return bankConnectionDatabaseController.delete(args);
  }

  read(args: BankSyncArgs): Promise<BankConnection[]> {
    return bankConnectionDatabaseController.read(args);
  }

  create(args: BankConnection): Promise<void> {
    return bankConnectionDatabaseController.add(args);
  }
}

export const bankConnectionController = new BankConnectionController();
