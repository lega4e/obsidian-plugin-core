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
  public hideOnLineChart: boolean;
  public items: Item[] = [];
  public calculatedItem: { [key: string]: Item } = {};
  public calculatedItems: { [key: string]: Item[] } = {};

  constructor(
    name: string,
    parents: Category[] = [],
    children: Category[] = [],
    color: string | undefined = undefined,
    skipOnDiagramm: boolean = false,
    hideOnLineChart: boolean = false,
  ) {
    this.name = name;
    this.parents = parents;
    this.children = children;
    this.color = color;
    this.skipOnDiagramm = skipOnDiagramm;
    this.hideOnLineChart = hideOnLineChart;
  }

  clear(recursive: boolean = false) {
    this.items = [];
    this.calculatedItem = {};
    this.calculatedItems = {};
    if (recursive) {
      this.children.forEach((c) => c.clear(true));
    }
  }

  summarizeWithItems(date?: string): [Item, Item[]] {
    return [this.summarize(date), this.calcItems(date)];
  }

  calcItems(date?: string): Item[] {
    if (this.calculatedItems[date ?? ""]) {
      return this.calculatedItems[date ?? ""];
    }

    if (this.items.length == 0) {
      this.calculatedItems[date ?? ""] = this.children
        .map((c) => c.summarize(date))
        .flat()
        .filter((item) => item.totalMinutes > 0);
    } else {
      this.calculatedItems[date ?? ""] = !date
        ? this.items
        : this.items.filter((item) => item.date == date);
    }

    return this.calculatedItems[date ?? ""];
  }

  summarize(date?: string): Item {
    if (this.calculatedItem[date ?? ""]) {
      return this.calculatedItem[date ?? ""];
    }

    this.calculatedItem[date ?? ""] = new Item(
      this,
      this.calcItems(date).reduce((acc, item) => acc + item.totalMinutes, 0),
      this.calcItems(date)
        .map((item) => item.comment)
        .filter((c) => c && c != "")
        .join(", "),
      this.calcItems(date),
      date,
    );

    return this.calculatedItem[date ?? ""];
  }
}