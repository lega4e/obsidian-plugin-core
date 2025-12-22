import { FuzzySuggestModal } from "obsidian";
import type { FuzzyMatch, App } from "obsidian";

export default class Suggester<T> extends FuzzySuggestModal<T> {
  private resolvePromise: (value: T | null) => void;
  private resolved: boolean;
  public promise: Promise<T | null>;

  public static suggest<T>(
    app: App,
    item2str: (item: T) => string,
    itemsGetter: () => T[],
    str2item?: (str: string) => T,
    inputEqualsItem?: (input: string, item: T) => boolean,
    initialValue?: string
  ) {
    return new Suggester(
      app,
      item2str,
      itemsGetter,
      str2item,
      inputEqualsItem,
      initialValue
    ).promise;
  }

  public constructor(
    app: App,
    private item2str: (item: T) => string,
    private itemsGetter: () => T[],
    private str2item?: (str: string) => T,
    private inputEqualsItem?: (input: string, item: T) => boolean,
    initialValue?: string
  ) {
    super(app);

    this.promise = new Promise<T | null>((resolve) => {
      this.resolvePromise = resolve;
    });

    this.inputEl.addEventListener("keydown", (event: KeyboardEvent) => {
      if (event.code !== "Tab" || !("chooser" in this)) {
        return;
      }

      const { values, selectedItem } = this.chooser as {
        values: {
          item: string;
          match: { score: number; matches: unknown[] };
        }[];
        selectedItem: number;
        [key: string]: unknown;
      };

      const { value } = this.inputEl;
      this.inputEl.value = values[selectedItem].item ?? value;
    });

    this.open();
    this.inputEl.value = initialValue ?? "";
    this.inputEl.dispatchEvent(new Event("input"));
  }

  override getItemText(item: T): string {
    return this.item2str(item);
  }

  override getItems(): T[] {
    let items = this.itemsGetter();
    if (this.str2item) {
      const additionalItem = this.str2item(this.inputEl.value);
      items = !items.some(
        (item) =>
          this.inputEqualsItem?.(this.inputEl.value, item) ??
          this.item2str(item).toLowerCase() ==
            this.item2str(additionalItem).toLowerCase()
      )
        ? [...items, additionalItem]
        : items;
    }
    return items;
  }

  override selectSuggestion(
    value: FuzzyMatch<T>,
    evt: MouseEvent | KeyboardEvent
  ) {
    this.resolved = true;
    super.selectSuggestion(value, evt);
  }

  override onChooseItem(item: T, _: MouseEvent | KeyboardEvent): void {
    this.resolved = true;
    this.resolvePromise(item);
  }

  override onClose() {
    super.onClose();
    if (!this.resolved) {
      this.resolvePromise(null);
    }
  }
}
