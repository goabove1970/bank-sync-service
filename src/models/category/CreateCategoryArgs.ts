import { CategoryType } from './category';
export interface CreateCategoryArgs {
    userId?: string;
    categoryId?: string;
    parentCategoryId?: string;
    caption?: string;
    categoryType?: CategoryType;
    icon?: string;
}
