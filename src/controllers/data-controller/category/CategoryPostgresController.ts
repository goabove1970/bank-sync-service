import { Category } from '@src/models/category/category';
import { DatabaseController } from '../DataController';
import { Value } from 'ts-postgres';

export class CategoryPostgresController extends DatabaseController<Category> {
    constructor() {
        super('categories');
    }

    readSelectResponse(values: Value[][]): Category[] {
        const collection: Category[] = [];
        values.forEach((valueRow) => {
            collection.push({
                caption: valueRow[0],
                categoryId: valueRow[1],
                parentCategoryId: valueRow[2],
                userId: valueRow[3],
                categoryType: valueRow[4],
                icon: valueRow[5],
            } as Category);
        });

        return collection;
    }
}

export const categoryPostgresDataController: DatabaseController<Category> = new CategoryPostgresController();
