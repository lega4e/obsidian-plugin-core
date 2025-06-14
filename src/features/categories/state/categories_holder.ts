import CategoriesConfigHolder from "./categories_config_holder";
import Category, { CategoryPack } from "../models/category";
import CategoryConfigManager from "../managers/category_config_manager";
import LazyDerivedValueNotifier from "src/utils/notifiers/lazy_derived_notifier";

export interface CategoriesState {
  packs: CategoryPack[];
  allCategories: Map<string, Category>;
  certainPack: CategoryPack;
  otherCategory: Category;
  discardCommentsLevel: number;
  itemsFieldName: string;
}

export default class CategoriesHolder extends LazyDerivedValueNotifier<CategoriesState | null> {
  constructor(categoriesConfigHolder: CategoriesConfigHolder) {
    super([categoriesConfigHolder], ([config]: [CategoriesConfigHolder]) =>
      !config.state ? null : CategoryConfigManager.calc(config.state)
    );
  }
}
