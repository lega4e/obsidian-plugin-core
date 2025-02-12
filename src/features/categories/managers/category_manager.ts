import { Category, CategoryPack } from "../models/category";
import { Item } from "../models/item";
import { DvApi } from "src/domain/interfaces/dv_api";

export class CategoryManager {
  private dv: DvApi;
  private packs: CategoryPack[] = [];
  private certainPack: CategoryPack | null = null;
  private otherCategory: Category | null = null;
  public discardComments: boolean = false;

  constructor(dv: DvApi, categoriesPath: string) {
    this.dv = dv;
    this._parseCategories(categoriesPath);
  }

  loadPages(pages: Record<string, any>[]): void {
    this._loadItems(pages);
  }

  clearPages(): void {
    this._clearCategoriesItems();
  }

  calculate(packType: string, date?: string): [Item, Item[]] {
    const pack = this.packs.find((p) => p.type == packType);
    if (!pack) {
      throw new Error(`Pack type ${packType} not found`);
    }

    const rootCategory = new Category(pack.prettyName, [], pack.categories);
    let [root, items] = rootCategory.summarizeWithItems(date);
    items = items.filter((item) => item.totalMinutes != 0);
    items = items.sort((a, b) => b.totalMinutes - a.totalMinutes);
    return [root, items];
  }

  calculateArray(packType: string, dates: string[]): [string, [Item, Item[]]][] {
    return dates.map((date) => 
      [date, this.calculate(packType, date)],
    );
  }

  getOtherCategory(): Category {
    return this.otherCategory!;
  }

  private _parseCategories(categoriesPath: string): void {
    this.packs = [];
    this.certainPack = null;
    this.otherCategory = null;

    const allCategories = new Map<string, Category>();
    const file = this.dv.page(categoriesPath);

    if (!file) {
      throw new Error(`Can't find file '${categoriesPath}'`);
    }

    const parsedData = file as unknown as CategoriesYaml;
    this.discardComments = parsedData.options.discardComments;

    this.otherCategory = new Category(
      parsedData.otherCategory.name,
      [],
      [],
      parsedData.otherCategory.color,
      parsedData.otherCategory.skipOnDiagramm,
    );

    for (const packYaml of parsedData.categories_packs) {
      let pack = new CategoryPack(packYaml.type, [], packYaml.prettyName);

      for (const categoryYaml of packYaml.categories) {
        if (allCategories.has(packYaml.type + "." + categoryYaml.name)) {
          throw new Error(`Category ${categoryYaml.name} already exists`);
        }

        const parents =
          categoryYaml.parents?.map((name) => {
            const parent = allCategories.get(name);
            if (!parent) {
              throw new Error(`Parent ${name} not found`);
            }
            return parent;
          }) || [];

        let category = new Category(
          categoryYaml.name,
          parents,
          [],
          categoryYaml.color,
          categoryYaml.skipOnDiagramm === true,
          categoryYaml.hideOnLineChart ?? true,
        );

        parents.forEach((parent) => parent.children.push(category));
        allCategories.set(packYaml.type + "." + categoryYaml.name, category);
        pack.categories.push(category);
      }

      if (packYaml.isCertain) {
        this.certainPack = pack;
      }

      this.packs.push(pack);
    }
  }

  private _clearCategoriesItems() {
    for (const pack of this.packs) {
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

          const certainCategory = this.certainPack?.find(category);
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