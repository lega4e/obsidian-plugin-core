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

  toString() {
    return (
      `Категория: ${this.name}` +
      `${
        this.parents.length > 0
          ? `; Родительские категории: ` +
            `${this.parents.map((p) => p.name).join(", ")}`
          : ""
      }`
    );
  }

  summarizeWithItems(): [Item, Item[]] {
    let items: Item[] = [];

    if (this.items.length != 0) {
      items = this.items;
    } else {
      items = this.children.map((c) => c.summarize()).flat();
    }

    return [
      new Item(
        this,
        items.reduce((acc, item) => acc + item.totalMinutes, 0),
        items.map((item) => item.comment).join(", "),
      ),
      items,
    ];
  }

  summarize(): Item {
    return this.summarizeWithItems()[0];
  }
}
