import { GuidFull } from '@utils/generateGuid';
import { DeepPartial } from '@models/DeepPartial';
import { Category, CategoryType } from '@src/models/category/category';
import { ReadCategoryArgs } from '@src/models/category/GetCategoryArgs';
import { CreateCategoryArgs } from '@src/models/category/CreateCategoryArgs';
import { DeleteCategoryArgs } from '@src/models/category/DeleteCategoryArgs';
import { DatabaseError } from '@root/src/models/errors/errors';

export function validateCreateCategoryArgs(args: CreateCategoryArgs): void {
    if (!args.caption) {
        throw new DatabaseError('Category name can not be empty');
    }
}

export function validateDeleteCategoryArgs(args: DeleteCategoryArgs): void {
    if (!args) {
        throw new DatabaseError('Can not delete category, arguments are missing');
    }

    if (!args.categoryId) {
        throw new DatabaseError('Can not delete category, no category id provided');
    }
}

export const toShortCategoryDetails = (category: Category): DeepPartial<Category> => {
    const details: DeepPartial<Category> = {
        userId: category.userId,
        categoryId: category.categoryId,
        caption: category.caption,
        categoryType: category.categoryType,
    };
    if (category.parentCategoryId) {
        details.parentCategoryId = category.parentCategoryId;
    }
    return details;
};

export const combineNewCategory = (args: CreateCategoryArgs): Category => {
    return {
        userId: args.userId,
        categoryId: GuidFull(),
        parentCategoryId: args.parentCategoryId,
        caption: args.caption,
        categoryType: args.userId ? CategoryType.UserDefined : CategoryType.Default,
    };
};

export function matchesReadArgs(args: ReadCategoryArgs): string {
    if (!args) {
        return '';
    }

    const conditions = [];
    if (args.categoryType) {
        conditions.push(`catgory_type=${!args.categoryType ? 'NULL' : args.categoryType.toString()}`);
    }

    if (args.categoryId) {
        conditions.push(`category_id='${args.categoryId}'`);
    }

    if (args.userId) {
        conditions.push(`(user_id='${args.userId}' OR user_id is NULL)`);
    }

    if (args.parentCategoryId) {
        conditions.push(`parent_category_id=${!args.parentCategoryId ? 'NULL' : args.parentCategoryId}`);
    }

    const finalSattement = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    return finalSattement;
}

export function validateCategoryUpdateArgs(args: CreateCategoryArgs): void {
    if (!args) {
        throw new DatabaseError('Can not update category, no arguments passed');
    }

    if (!args.categoryId) {
        throw new DatabaseError('Can not update category, no categoryId passed');
    }

    if (args.categoryId === args.parentCategoryId) {
        throw new DatabaseError('Category can not nest itself');
    }

    validateCreateCategoryArgs(args);
}
