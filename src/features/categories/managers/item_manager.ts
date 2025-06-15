import removeDuplicates from "src/utils/remove_duplicates";
import Item, { formatMinutes } from "../models/item";
import { CategoriesState } from "../state/categories_holder";
import { CommentsAndCategoryScore } from "../state/comments_and_category_score_holder";

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
        page[itemsFieldName].map((entry: string) =>
          this.parseEntry(entry, categories, page.file.name)
        )
      )
      .flat();
  }

  static parseEntry(
    entry: string,
    categories: CategoriesState,
    date: string
  ): Item {
    const match = entry.match(ItemManager.entryRegex);

    if (!match) {
      throw new Error(`error with match ${entry} | ${match}`);
    }

    const category = match[1].trim();
    const minutes = parseInt(match[3] || "0") * 60 + parseInt(match[4] || "0");

    const certainCategory = categories.certainPack.categories.find(
      (c) => c.prettyName == category
    );
    if (!certainCategory) {
      throw new Error(`Не найдено конкретной категории ${category}`);
    }

    return {
      categoryName: certainCategory.name,
      minutes,
      date,
      comment: match[2],
    };
  }

  static formatEntry(
    categoryPrettyName: string,
    minutes: number,
    comment?: string
  ): string {
    return (
      `${categoryPrettyName}` +
      (comment ? ` (${comment})` : "") +
      ` ${formatMinutes(Math.max(0, minutes))}`
    );
  }

  static calcCommentsAndCategoryScore(
    pages: Record<string, any>[],
    categories: CategoriesState,
    itemsFieldName: string
  ): CommentsAndCategoryScore {
    const score: Record<string, number> = {};

    const fields = pages
      .map((page) => page[itemsFieldName] as string[] | undefined)
      .filter((field) => field != undefined);

    const comments = Array.from(
      fields.map((field) =>
        field
          .map((entry: string) => {
            const match = entry.match(ItemManager.entryRegex);

            if (!match) {
              return undefined;
            }

            const category = match[1].trim();
            const certainCategory = categories.certainPack.categories.find(
              (c) => c.prettyName == category
            );

            if (certainCategory) {
              score[certainCategory.name] =
                (score[certainCategory.name] ?? 0) + 1;
            }

            return !match[2]
              ? undefined
              : {
                  comment: match[2],
                  categoryName: certainCategory?.name ?? null,
                  categoryPrettyName: certainCategory?.prettyName ?? null,
                };
          })
          .filter((comment) => comment != undefined)
      )
    ).flat();

    return {
      comments: removeDuplicates(comments, (comment) => comment.comment).sort(
        (a, b) => a.comment.localeCompare(b.comment)
      ),
      categoryScore: score,
    };
  }
}
