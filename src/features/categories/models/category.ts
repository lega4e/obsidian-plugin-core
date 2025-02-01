import { Item } from "./item";

export class CategoryPack {
  public type: string;
  public categories: Category[];
  public prettyName: string;

  constructor(type: string, categories: Category[], prettyName: string) {
    this.type = type;
    this.categories = categories;
    this.prettyName = prettyName;
  }

  find(name: string): Category | undefined {
    return this.categories.find((c) => c.name == name);
  }
}

export class Category {
  public name: string; // as id
  public parents: Category[];
  public children: Category[];
  public color: string | undefined;
  public skipOnDiagramm: boolean;
  public items: Item[] = [];
  public calculatedItem?: Item;

  constructor(
    name: string,
    parents: Category[] = [],
    children: Category[] = [],
    color: string | undefined = undefined,
    skipOnDiagramm: boolean = false,
  ) {
    this.name = name;
    this.parents = parents;
    this.children = children;
    this.color = color;
    this.skipOnDiagramm = skipOnDiagramm;
  }

  clear(recursive: boolean = false) {
    this.items = [];
    this.calculatedItem = undefined;
    if (recursive) {
      this.children.forEach((c) => c.clear(true));
    }
  }

  summarizeWithItems(): [Item, Item[]] {
    return [this.summarize(), this.calcItems()];
  }

  calcItems(): Item[] {
    if (this.items.length == 0) {
      this.items = this.children
        .map((c) => c.summarize())
        .flat()
        .filter((item) => item.totalMinutes > 0);
    }
    return this.items;
  }

  summarize(): Item {
    if (this.calculatedItem) {
      return this.calculatedItem;
    }

    this.calculatedItem = new Item(
      this,
      this.calcItems().reduce((acc, item) => acc + item.totalMinutes, 0),
      this.calcItems()
        .map((item) => item.comment)
        .filter((c) => c && c != "")
        .join(", "),
      this.calcItems(),
    );

    return this.calculatedItem;
  }
}