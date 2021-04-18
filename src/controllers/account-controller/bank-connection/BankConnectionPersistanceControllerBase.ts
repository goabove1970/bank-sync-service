import { BankConnection } from '@root/src/models/bank-connection';
import { BankSyncArgs } from '@root/src/routes/connections-request';

export abstract class BankConnectionPersistanceControllerReadonlyBase {
  abstract read(args: BankSyncArgs): Promise<BankConnection[]>;
}

export abstract class BankConnectionPersistanceControllerBase extends BankConnectionPersistanceControllerReadonlyBase {
  abstract update(args: BankSyncArgs): Promise<void>;
  abstract add(args: BankSyncArgs): Promise<void>;
  abstract delete(args: BankSyncArgs): Promise<void>;
}
