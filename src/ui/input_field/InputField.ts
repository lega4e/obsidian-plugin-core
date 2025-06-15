export interface InputFieldConfig {
  placeholder: string;
  initialValue: string;
  width?: string;
  cls?: string;
  onClick?: () => void;
  onInput?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onEnter?: () => void;
}

export default class InputField {
  private inputEl: HTMLInputElement;

  constructor(
    private container: HTMLElement,
    private config: InputFieldConfig
  ) {
    this.createField();
  }

  private createField() {
    this.inputEl = this.container.createEl("input", {
      type: "text",
      attr: {
        placeholder: this.config.placeholder,
        value: this.config.initialValue,
      },
      cls: this.config.cls ?? "lega4e-input-field",
    });

    this.inputEl.style.cssText = `
      padding: 6px 10px;
      margin: 4px;
      border: 1px solid var(--background-modifier-border);
      border-radius: 4px;
      font-family: inherit;
      font-size: 0.9em;
      background: var(--background-primary);
      color: var(--text-normal);
      width: ${this.config.width ?? "150px"};
      transition: width 0.2s ease;
    `;

    if (this.config.onClick) {
      this.inputEl.addEventListener("click", async () => {
        this.config.onClick?.();
      });
    }

    if (this.config.onInput) {
      this.inputEl.addEventListener("input", async () => {
        this.config.onInput?.();
      });
    }

    if (this.config.onFocus) {
      this.inputEl.addEventListener("focus", async () => {
        this.config.onFocus?.();
      });
    }

    if (this.config.onBlur) {
      this.inputEl.addEventListener("blur", async () => {
        this.config.onBlur?.();
      });
    }

    if (this.config.onEnter) {
      this.inputEl.addEventListener("keydown", async (e) => {
        if (e.key === "Enter") {
          this.config.onEnter?.();
        }
      });
    }
  }

  get value(): string {
    return this.inputEl.value;
  }

  set value(value: string) {
    this.inputEl.value = value;
  }
}
