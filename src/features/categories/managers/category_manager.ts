import Item from "../models/item";
import { CategoriesState } from "../state/categories_holder";
import {
  CalculatedCategories,
  CalculatedCategory,
  CalculatedCategoryDated,
} from "../state/calculated_categories_holder";
import Category from "../models/category";

export default class CategoryManager {
  constructor() {}

  static calc(
    categories: CategoriesState,
    items: Item[]
  ): CalculatedCategories {
    const averages: Record<string, CalculatedCategory> = {};
    const historyMap: Record<string, Record<string, CalculatedCategory>> = {}; // date -> category -> unit
    const totalDateMinutes: Record<string, number> = {};
    let totalMinutes = 0;

    for (const item of items) {
      const comment = this.discardComment(
        item,
        categories.discardCommentsLevel
      );

      const certainCategory = categories.allCategories.get(item.categoryName);
      if (!certainCategory) {
        throw new Error(`Category ${item.categoryName} not found`);
      }

      [certainCategory, ...this.getAllParents(certainCategory)].forEach((c) => {
        this.pushUnitToAverages(
          averages,
          c,
          certainCategory,
          comment,
          item.minutes
        );
        this.pushUnitToHistory(
          historyMap,
          c,
          certainCategory,
          comment,
          item.minutes,
          item.date
        );
      });
      totalDateMinutes[item.date] =
        (totalDateMinutes[item.date] ?? 0) + item.minutes;

      totalMinutes += item.minutes;
    }

    const history: Record<string, CalculatedCategoryDated[]> = {};
    for (const [catName, catMap] of Object.entries(historyMap)) {
      history[catName] = Object.entries(catMap).map(([date, cat]) => ({
        ...cat,
        date,
      }));
    }

    return {
      averages,
      history,
      totalMinutes,
      totalDateMinutes,
    };
  }

  private static pushUnitToAverages(
    averages: Record<string, CalculatedCategory>,
    category: Category,
    certainCategory: Category,
    comment: string | null,
    minutes: number
  ): void {
    const cat = averages[category.name];

    if (!cat) {
      averages[category.name] = this.makeCalculatedCategory(
        category,
        certainCategory,
        comment,
        minutes
      );
    } else {
      this.putUnitUnitCategory(cat, certainCategory, minutes, comment);
    }
  }

  private static pushUnitToHistory(
    history: Record<string, Record<string, CalculatedCategory>>,
    category: Category,
    certainCategory: Category,
    comment: string | null,
    minutes: number,
    date: string
  ): void {
    let catMap = history[category.name];
    if (!catMap) {
      catMap = {};
      history[category.name] = catMap;
    }

    const cat = catMap[date];
    if (!cat) {
      catMap[date] = this.makeCalculatedCategory(
        category,
        certainCategory,
        comment,
        minutes
      );
    } else {
      this.putUnitUnitCategory(cat, certainCategory, minutes, comment);
    }
  }

  private static putUnitUnitCategory(
    category: CalculatedCategory,
    certainCategory: Category,
    minutes: number,
    comment: string | null
  ) {
    category.totalMinutes += minutes;
    const unit = category.units.find(
      (u) =>
        u.comment == comment && u.certainCategory == certainCategory.prettyName
    );
    if (unit) {
      unit.minutes += minutes;
    } else {
      category.units.push({
        minutes,
        comment,
        certainCategory: certainCategory.prettyName,
      });
    }
  }

  private static makeCalculatedCategory(
    category: Category,
    certainCategory: Category,
    comment: string | null,
    minutes: number
  ): CalculatedCategory {
    return {
      name: category.name,
      prettyName: category.prettyName,
      totalMinutes: minutes,
      color: category.color,
      hideOnLineChart: category.hideOnLineChart,
      units: [
        {
          minutes,
          comment,
          certainCategory: certainCategory.prettyName,
        },
      ],
    };
  }

  private static discardComment(
    item: Item,
    discardCommentsLevel: number
  ): string | null {
    return !discardCommentsLevel
      ? null
      : item.comment
          ?.split(";")
          .map((s) => s.trim())
          .slice(0, discardCommentsLevel)
          .join("; ") ?? null;
  }

  private static getAllParents(category: Category): Category[] {
    return [
      ...category.parents,
      ...category.parents.flatMap((p) => this.getAllParents(p)),
    ];
  }
}
