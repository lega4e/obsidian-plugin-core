import Item from "../models/item";
import CategoryPagesHolder from "./category_pages_holder";
import ItemConfigManager from "../managers/item_manager";
import CategoriesHolder from "./categories_holder";
import LazyDerivedValueNotifier from "src/utils/notifiers/lazy_derived_notifier";

export default class CalculatedItemHolder extends LazyDerivedValueNotifier<
  Item[]
> {
  constructor(
    categoryPagesHolder: CategoryPagesHolder,
    categoriesHolder: CategoriesHolder
  ) {
    super(
      [categoryPagesHolder, categoriesHolder],
      ([categoryPages, categories]: [
        CategoryPagesHolder,
        CategoriesHolder
      ]) => {
        return categoryPages.state && categories.state
          ? ItemConfigManager.calc(
              categoryPages.state.filter((page) => !!page),
              categories.state,
              categories.state.itemsFieldName
            )
          : [];
      }
    );
  }
}
