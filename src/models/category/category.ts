export interface Category {
  userId?: string;
  categoryId?: string;
  parentCategoryId?: string;
  caption?: string;
  icon?: string;
  categoryType?: CategoryType;
}

export enum CategoryType {
  Default = 1,
  UserDefined = 2,
}
