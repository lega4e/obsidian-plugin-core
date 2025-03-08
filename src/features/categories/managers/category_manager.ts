import { Category } from "../models/category";
import { Item } from "../models/item";
import { inject, injectable } from "inversify";
import { TYPES } from "src/domain/di/types";
import { CategoriesHolder, CategoriesState } from "../state/categories_holder";
import { CategoryData, HistoryInfo, HistoryDayInfo } from "../models/interfaces";

@injectable()
export class CategoryManager {
  constructor(
    @inject(TYPES.CategoriesHolder)
    private categories: CategoriesHolder,
  ) {}

  loadPages(pages: Record<string, any>[]): void {
    this._loadItems(pages);
  }

  clearPages(): void {
    this._clearCategoriesItems();
  }

  calculate(packType: string, date?: string): CategoryData {
    const categories = this._getCategories();

    const pack = categories.packs.find((p) => p.type == packType);
    if (!pack) {
      throw new Error(`Pack type ${packType} not found`);
    }

    const rootCategory = new Category(pack.prettyName, [], pack.categories);
    let [root, items] = rootCategory.summarizeWithItems(date);
    items = items.filter((item) => item.totalMinutes != 0);
    items = items.sort((a, b) => b.totalMinutes - a.totalMinutes);
    return { root, items };
  }

  calculateArray(
    packType: string,
    dates: string[],
  ): HistoryInfo {
    return dates.map((date) => ({ date, ...this.calculate(packType, date) }));
  }

  getOtherCategory(): Category {
    return this._getCategories().otherCategory;
  }

  private _getCategories(): CategoriesState {
    const categories = this.categories.value;
    if (!categories) {
      throw new Error("Categories not found");
    }

    return categories;
  }

  private _clearCategoriesItems() {
    for (const pack of this._getCategories().packs) {
      for (const category of pack.categories) {
        category.clear();
      }
    }
  }

  private _loadItems(pages: Record<string, any>[]): void {
    this._clearCategoriesItems();
    pages = pages.filter((page) => page["Времяучёт"]);

    for (const page of pages) {
      const entries = page["Времяучёт"];
      for (const entry of entries) {
        const match = entry.match(
          /^([^\d()]*)\s*(?:\((.*?)\))?\s*(?:(\d+)ч\.?)?\s*(?:(\d+)м\.?)?$/,
        );

        if (match) {
          const category = match[1].trim();
          const minutes =
            parseInt(match[3] || "0") * 60 + parseInt(match[4] || "0");

          const certainCategory =
            this._getCategories().certainPack.categories.find(
              (c) => c.name == category,
            );
          if (!certainCategory) {
            throw new Error(`Не найдено конкретной категории ${category}`);
          }

          certainCategory.items.push(
            new Item(
              certainCategory,
              minutes,
              match[2],
              undefined,
              page.file.name,
            ),
          );
        } else {
          throw new Error(`error with match ${entry} | ${match}`);
        }
      }
    }
  }
}