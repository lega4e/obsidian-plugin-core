import Item from "../models/item";
import { CategoriesState } from "../state/categories_holder";

export default class ItemManager {
  static readonly entryRegex =
    /^([^\d()]*)\s*(?:\((.*?)\))?\s*(?:(\d+)ч\.?)?\s*(?:(\d+)м\.?)?$/;

  static calc(
    pages: Record<string, any>[],
    categories: CategoriesState,
    itemsFieldName: string
  ): Item[] {
    return pages
      .map((page) =>
        page[itemsFieldName].map((entry: string): Item => {
          const match = entry.match(ItemManager.entryRegex);

          if (!match) {
            throw new Error(`error with match ${entry} | ${match}`);
          }

          const category = match[1].trim();
          const minutes =
            parseInt(match[3] || "0") * 60 + parseInt(match[4] || "0");

          const certainCategory = categories.certainPack.categories.find(
            (c) => c.prettyName == category
          );
          if (!certainCategory) {
            throw new Error(`Не найдено конкретной категории ${category}`);
          }

          return {
            categoryName: certainCategory.name,
            minutes,
            date: page.file.name,
            comment: match[2],
          };
        })
      )
      .flat();
  }
}
