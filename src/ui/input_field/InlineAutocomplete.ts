import { App } from "obsidian";
import Suggester from "./Suggester";
import InputField from "./InputField";

export interface AutocompleteConfig<T> {
  initialValue: string;
  placeholder: string;
  width?: string;
  suggestions: () => Promise<T[]>;
  item2str: (item: T) => string; // то, что будет показываться в инлайн-поле
  item2suggestion: (item: T) => string; // то, что будет показываться в выпадающем списке
  onSelect: (value: T) => void;
  str2item?: (str: string) => T;
  inputEqualsItem?: (input: string, item: T) => boolean;
  onEnter?: () => void;
}

export default class InlineAutocomplete<T> {
  private inputField: InputField;
  private choosenValue: T | null = null;

  constructor(
    private app: App,
    private containerEl: HTMLElement,
    private config: AutocompleteConfig<T>
  ) {
    this.createField();
  }

  private createField() {
    this.inputField = new InputField(this.containerEl, {
      placeholder: this.config.placeholder,
      initialValue: this.config.initialValue,
      cls: "lega4e-inline-autocomplete-input",
      width: this.config.width,
      onClick: async () => await this.showSuggestions(),
      onInput: async () => {
        if (this.inputField.value.length != 0) {
          await this.showSuggestions();
        }
      },
      onEnter: this.config.onEnter,
    });
  }

  private async showSuggestions() {
    const suggestions = await this.config.suggestions();

    this.value = await Suggester.suggest<T>(
      this.app,
      this.config.item2suggestion,
      () => suggestions,
      this.config.str2item,
      this.config.inputEqualsItem
    );

    if (this.value) {
      this.config.onSelect(this.value);
    }
  }

  public get value(): T | null {
    return this.choosenValue;
  }

  public set value(value: T | null) {
    this.choosenValue = value;
    this.inputField.value = value ? this.config.item2str(value) : "";
  }
}
