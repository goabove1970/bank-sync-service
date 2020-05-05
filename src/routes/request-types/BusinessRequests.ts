import { ResponseBase } from './Requests';
import { BusinessCreateArgs } from '@root/src/models/business/BusinessCreateArgs';
import { BusinessUpdateArgs } from '@root/src/models/business/BusinessUpdateArgs';
import { BusinessDeleteArgs } from '@root/src/models/business/BusinessDeleteArgs';
import { BusinessReadArgs } from '@root/src/models/business/BusinessReadArgs';

export enum BusinessRequestType {
    Read = 'read',
    Create = 'create',
    Delete = 'delete',
    Update = 'update',
    AddRule = 'add-rule',
}

export interface BusinessRequest {
    action?: BusinessRequestType;
    args?: BusinessCreateArgs & BusinessUpdateArgs & BusinessDeleteArgs & BusinessReadArgs;
}

export interface BusinessResponse extends ResponseBase {
    action?: BusinessRequestType;
}
