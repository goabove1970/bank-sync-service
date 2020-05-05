import { DeepPartial } from '@models/DeepPartial';
import { Business } from '@root/src/models/business/Business';
import { BusinessReadArgs } from '@root/src/models/business/BusinessReadArgs';
import { BusinessCreateArgs } from '@root/src/models/business/BusinessCreateArgs';
import { BusinessUpdateArgs } from '@root/src/models/business/BusinessUpdateArgs';
import { BusinessDeleteArgs } from '@root/src/models/business/BusinessDeleteArgs';
import { AddRuleArgs } from '@root/src/models/business/AddRuleArgs';

export abstract class BusinessPersistanceControllerReadonlyBase {
    abstract read(args: BusinessReadArgs): Promise<DeepPartial<Business>[]>;
}

export abstract class BusinessPersistanceControllerBase extends BusinessPersistanceControllerReadonlyBase {
    abstract addRule(request: AddRuleArgs): Promise<void>;
    abstract create(args: BusinessCreateArgs): Promise<string>;
    abstract update(args: BusinessUpdateArgs): Promise<void>;
    abstract delete(args: BusinessDeleteArgs): Promise<void>;
}
