import { ResponseBase } from './Requests';
import { CreateCategoryArgs } from '@src/models/category/CreateCategoryArgs';
import { DeleteCategoryArgs } from '@src/models/category/DeleteCategoryArgs';
import { ReadCategoryArgs } from '@src/models/category/GetCategoryArgs';
import { DeepPartial } from '@src/models/DeepPartial';
import { Category } from '@src/models/category/category';

export enum CategoryRequestType {
    Read = 'read',
    Create = 'create',
    Delete = 'delete',
    Update = 'update',
}

export interface CategoryRequest {
    action?: CategoryRequestType;
    args?: CreateCategoryArgs & DeleteCategoryArgs & ReadCategoryArgs;
}

export interface CategoryResponse extends ResponseBase {
    action?: CategoryRequestType;
    payload?: {
        categoryId?: string;
        count?: number;
        categories?: DeepPartial<Category>[];
    };
}
