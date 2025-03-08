import { Category } from "./category";

export function formatMinutes(totalMinutes: number): string {
  const minutes = Math.round(totalMinutes % 60);
  const hours = Math.floor(totalMinutes / 60);

  return totalMinutes == 0
    ? "0"
    : (
        `${hours != 0 ? hours.toString() + "ч." : ""} ` +
        `${minutes != 0 || hours == 0 ? minutes.toString() + "м." : ""}`
      ).trim();
}

export class Item {
  public category?: Category;
  public totalMinutes: number;
  public comment?: string;
  public children: Item[] = [];
  public date?: string;

  constructor(
    category: Category | undefined,
    totalMinutes: number,
    comment?: string,
    children: Item[] = [],
    date?: string,
  ) {
    this.category = category;
    this.totalMinutes = totalMinutes;
    this.comment = comment;
    this.children = children;
    this.date = date;
  }

  pretty(): string {
    return formatMinutes(this.totalMinutes);
  }

  leafs(): Item[] {
    if (this.children.length == 0) {
      return [this];
    }

    return this.children.flatMap((c) => c.leafs());
  }

  prettyLeafs(discardComments: number = 0): Item[] {
    return Item.aggregate(this.leafs(), discardComments);
  }

  static aggregate(items: Item[], discardComments: number = 0): Item[] {
    function key(item: Item): string {
      return (
        item.category!.name! +
        (discardComments && item.comment && item.comment != ""
          ? ` (${item.comment.split(";").slice(0, discardComments).join(";")})`
          : "")
      );
    }

    const aggregatedItems = new Map<string, Item>();

    for (const item of items) {
      let existedItem = aggregatedItems.get(key(item));
      if (existedItem) {
        existedItem.totalMinutes += item.totalMinutes;
      } else {
        aggregatedItems.set(
          key(item),
          new Item(
            item.category,
            item.totalMinutes,
            item.comment,
            [],
            item.date,
          ),
        );
      }
    }

    return Array.from(aggregatedItems.values()).sort(
      (a, b) => b.totalMinutes - a.totalMinutes,
    );
  }

  static isEqualComments(lhs: string, rhs: string, level: number): boolean {
    if (level == 0) {
      return true;
    }

    if (level < 0) {
      return lhs == rhs;
    }

    const lhsWords = lhs.split(";");
    const rhsWords = rhs.split(";");

    for (let i = 0; i < level; ++i) {
      if (i < lhsWords.length && i < rhsWords.length) {
        return lhsWords.length == rhsWords.length;
      }

      if (lhsWords[i] != rhsWords[i]) {
        return false;
      }
    }

    return true;
  }
}