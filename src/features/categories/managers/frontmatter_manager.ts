import { App, TFile } from "obsidian";
import YamlHeader from "src/library/obsidian/YamlHeader";
import ValueNotifier from "src/utils/notifiers/value_notifier";
import ItemManager from "./item_manager";
import CategoriesHolder from "../state/categories_holder";
import Item from "../models/item";

export default class FrontmatterManager {
  private yamlHeader = new YamlHeader<Record<string, any>>(this.app);

  constructor(
    private app: () => App,
    private itemFieldNameHolder: ValueNotifier<string | null>,
    private categoriesHolder: CategoriesHolder
  ) {}

  async addTimeEntry(file: TFile, entry: string): Promise<void> {
    await this.yamlHeader.updateField<string[]>(
      file,
      this.itemFieldNameHolder.state!,
      (entries) => {
        if (!entries || entries.length === 0) {
          return [entry];
        }

        const currentEntry = ItemManager.parseEntry(
          entry,
          this.categoriesHolder.state!,
          file.name
        );

        for (
          let i = entries.length - 1;
          i >= Math.max(0, entries.length - 2);
          --i
        ) {
          const lastEntry = ItemManager.parseEntry(
            entries[i]!,
            this.categoriesHolder.state!,
            file.name
          );

          if (this.isCompatible(currentEntry, lastEntry)) {
            return [
              ...entries.slice(0, i),
              this.merge(currentEntry, lastEntry),
              ...entries.slice(i + 1),
            ];
          }
        }

        return [...entries, entry];
      }
    );
  }

  async removeLastTimeEntry(file: TFile): Promise<void> {
    await this.yamlHeader.updateField<string[]>(
      file,
      this.itemFieldNameHolder.state!,
      (value) => ((value?.length ?? 0) > 0 ? value!.slice(0, -1) : [])
    );
  }

  private isCompatible(lhs: Item, rhs: Item): boolean {
    return lhs.categoryName === rhs.categoryName && lhs.comment === rhs.comment;
  }

  private merge(lhs: Item, rhs: Item): string {
    return ItemManager.formatEntry(
      this.categoriesHolder.state!.allCategories.get(lhs.categoryName)!
        .prettyName,
      lhs.minutes + rhs.minutes,
      lhs.comment ?? rhs.comment ?? undefined
    );
  }
}
