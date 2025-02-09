import { Category } from "./category";

export function formatMinutes(totalMinutes: number): string {
  const minutes = totalMinutes % 60;
  const hours = Math.floor(totalMinutes / 60);

  return totalMinutes == 0 ? "0" : (
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

  prettyLeafs(discardComments: boolean = false): Item[] {
    function key(item: Item): string {
      return (
        item.category!.name! +
        (discardComments && item.comment && item.comment != ""
          ? ` (${item.comment})`
          : "")
      );
    }

    const leafs = this.leafs();
    const items = new Map<string, Item>();

    for (const item of leafs) {
      let existedItem = items.get(key(item));
      if (existedItem) {
        existedItem.totalMinutes += item.totalMinutes;
      } else {
        items.set(
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

    return Array.from(items.values()).sort(
      (a, b) => b.totalMinutes - a.totalMinutes,
    );
  }
}