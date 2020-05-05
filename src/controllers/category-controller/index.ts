import { categoryPersistanceController } from '../data-controller/category/CatgoryPersistanceController';
import { Category } from '@src/models/category/category';
import { DeepPartial } from '@src/models/DeepPartial';
import { ReadCategoryArgs } from '@src/models/category/GetCategoryArgs';
import { CreateCategoryArgs } from '@src/models/category/CreateCategoryArgs';
import { DeleteCategoryArgs } from '@src/models/category/DeleteCategoryArgs';
import { CategoryPersistanceControllerBase } from '../data-controller/category/CategoryPersistanceControllerBase';

export class CategoryController implements CategoryPersistanceControllerBase {
  delete(args: DeleteCategoryArgs): Promise<void> {
    return categoryPersistanceController.delete(args);
  }
  read(args: ReadCategoryArgs): Promise<DeepPartial<Category>[]> {
    return categoryPersistanceController.read(args);
  }
  create(args: CreateCategoryArgs): Promise<string> {
    return categoryPersistanceController.create(args);
  }
  update(args: CreateCategoryArgs): Promise<void> {
    return categoryPersistanceController.update(args);
  }
}

const categoryController: CategoryPersistanceControllerBase = new CategoryController();
export default categoryController;
