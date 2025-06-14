import LazyDerivedValueNotifier from "src/utils/notifiers/lazy_derived_notifier";
import CalculatedItemHolder from "./calculated_item_holder";
import CategoryManager from "../managers/category_manager";
import CategoriesHolder from "./categories_holder";

export interface TimeUnit {
  certainCategory: string;
  minutes: number;
  comment: string | null;
}

export interface CalculatedCategory {
  name: string;
  prettyName: string;
  totalMinutes: number;
  color: string;
  hideOnLineChart: boolean;
  units: TimeUnit[];
}

export interface CalculatedCategoryDated extends CalculatedCategory {
  date: string;
}

export interface CalculatedCategories {
  averages: Record<string, CalculatedCategory>; // category name -> category
  history: Record<string, CalculatedCategoryDated[]>; // category name -> category[]
  totalDateMinutes: Record<string, number>; // date -> total date minutes
  totalMinutes: number;
}

export default class CalculatedCategoriesHolder extends LazyDerivedValueNotifier<CalculatedCategories | null> {
  constructor(
    categoriesHolder: CategoriesHolder,
    itemsHolder: CalculatedItemHolder
  ) {
    super([categoriesHolder, itemsHolder], () =>
      categoriesHolder.state && itemsHolder.state
        ? CategoryManager.calc(categoriesHolder.state, itemsHolder.state)
        : null
    );
  }
}
