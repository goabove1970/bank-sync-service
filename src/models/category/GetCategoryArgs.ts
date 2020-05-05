import { CategoryType } from './category';

export interface ReadCategoryArgs {
    userId?: string;
    categoryId?: string;
    parentCategoryId?: string;
    categoryType?: CategoryType;
}
