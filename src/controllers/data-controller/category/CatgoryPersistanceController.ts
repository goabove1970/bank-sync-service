import { CategoryPersistanceControllerBase } from './CategoryPersistanceControllerBase';
import { DeepPartial } from '@models/DeepPartial';
import {
    validateCreateCategoryArgs,
    combineNewCategory,
    validateCategoryUpdateArgs,
    validateDeleteCategoryArgs,
    toShortCategoryDetails,
    matchesReadArgs,
} from './helper';
import { Category, CategoryType } from '@src/models/category/category';
import { CreateCategoryArgs } from '@src/models/category/CreateCategoryArgs';
import { DeleteCategoryArgs } from '@src/models/category/DeleteCategoryArgs';
import { ReadCategoryArgs } from '@src/models/category/GetCategoryArgs';
import { DatabaseError } from '@src/models/errors/errors';
import { categoryPostgresDataController } from './CategoryPostgresController';
import { DatabaseController } from '../DataController';

export class CategoryPersistanceController implements CategoryPersistanceControllerBase {
    private dataController: DatabaseController<Category>;

    constructor(controller: DatabaseController<Category>) {
        this.dataController = controller;
    }

    delete(args: DeleteCategoryArgs): Promise<void> {
        validateDeleteCategoryArgs(args);
        return this.findCategoryImpl(args.categoryId)
            .then((category) => {
                if (!category) {
                    throw new DatabaseError('Error deleting category, could not find category record');
                }
                if (category.categoryType === CategoryType.Default && args.userId) {
                    throw new DatabaseError(
                        'User can not delete default categories, only custom user ctegories can be deleted by user'
                    );
                }
            })
            .then(() => {
                this.dataController.delete(`where category_id='${args.categoryId}'`);
            })
            .catch((error) => {
                throw error;
            });
    }
    create(args: CreateCategoryArgs): Promise<string> {
        const n: Category = combineNewCategory(args);
        validateCreateCategoryArgs(args);
        return this.checkDuplicateName(args.caption, args.userId)
            .then(() => this.findCategoryImpl(args.parentCategoryId))
            .then((catgory) => {
                if (args.parentCategoryId && !catgory) {
                    throw new DatabaseError('parentCategoryId does not exist');
                }
            })
            .then(() => {
                return this.dataController.insert(`(
                caption, category_id, parent_category_id, user_id, category_type, icon)
                VALUES (
                    '${n.caption}',
                    '${n.categoryId}',
                    ${!n.parentCategoryId ? 'NULL' : "'" + n.parentCategoryId + "'"},
                    ${!n.userId ? 'NULL' : "'" + n.userId + "'"},
                    ${!n.categoryType ? 'NULL' : n.categoryType},
                    ${!n.icon ? 'NULL' : "'" + n.icon + "'"});`);
            })
            .then(() => {
                return n.categoryId;
            })
            .catch((error) => {
                throw error;
            });
    }
    update(args: CreateCategoryArgs): Promise<void> {
        validateCategoryUpdateArgs(args);
        return this.checkDuplicateName(args.caption, args.userId)
            .then(() => this.findCategoryImpl(args.parentCategoryId))
            .then((category) => {
                if (args.parentCategoryId && !category) {
                    throw new DatabaseError('parentCategoryId does not exist');
                }
            })
            .then(() => this.findCategoryImpl(args.categoryId))
            .then((c) => {
                if (!c) {
                    throw new DatabaseError('Error updating category, could not find category record');
                }
                return c;
            })
            .then((c) => {
                if (args.parentCategoryId) {
                    c.parentCategoryId = args.parentCategoryId;
                }

                if (args.caption) {
                    c.caption = args.caption;
                }
                if (args.icon) {
                    c.icon = args.icon;
                }
                return c;
            })
            .then((c) => {
                this.dataController.update(`
                SET
                    caption='${c.caption}',
                    icon=${!c.icon ? 'NULL' : "'" + c.icon + "'"},
                    parent_category_id=${!c.parentCategoryId ? 'NULL' : "'" + c.parentCategoryId + "'"},
                    user_id=${!c.userId ? 'NULL' : "'" + c.userId + "'"},
                    category_type=${!c.categoryType ? 'NULL' : c.categoryType}
                WHERE 
                    category_id='${c.categoryId}';`);
            })
            .catch((error) => {
                throw error;
            });
    }
    read(args: ReadCategoryArgs): Promise<DeepPartial<Category>[]> {
        return this.dataController
            .select(matchesReadArgs(args))
            .then((c) => c.map(toShortCategoryDetails))
            .catch((error) => {
                throw error;
            });
    }

    checkDuplicateName(categoryName: string, userId?: string): Promise<void> {
        let condition = `WHERE caption='${categoryName}'`;
        if (userId) {
            condition += ` AND user_id='${userId.toString()}'`;
        }

        return this.dataController
            .select(condition)
            .then((collection) => {
                if (collection && collection.length > 0) {
                    throw new DatabaseError('Category with this name already exists');
                }
            })
            .catch((error) => {
                throw error;
            });
    }

    private findCategoryImpl(categoryId: string): Promise<Category | undefined> {
        return this.dataController
            .select(`WHERE category_id='${categoryId}'`)
            .then((c) => {
                {
                    return c && c.length > 0 ? c[0] : undefined;
                }
            })
            .catch((error) => {
                throw error;
            });
    }
}

export const categoryPersistanceController = new CategoryPersistanceController(categoryPostgresDataController);
