import InlineAutocomplete from "src/ui/input_field/InlineAutocomplete";
import CategoriesHolder from "../state/categories_holder";
import { App, Notice } from "obsidian";
import DvApi from "src/domain/interfaces/dv_api";
import AllCommentsHolder, {
  CommentWithCategory,
} from "../state/all_comments_holder";
import Category from "../models/category";
import ValueNotifier from "src/utils/notifiers/value_notifier";
import CategoryScoreHolder from "../state/category_score_holder";
import FrontmatterManager from "../managers/frontmatter_manager";
import TimeNoteHolder from "../state/time_note_holder";
import InputField from "src/ui/input_field/InputField";
import ItemManager from "../managers/item_manager";

export default class EnterCategoryWidget {
  private categoryAutocomplete: InlineAutocomplete<Category>;
  private commentAutocomplete: InlineAutocomplete<CommentWithCategory>;
  private minutesInput: InputField;
  private confirmButton: HTMLElement;

  constructor(
    public container: HTMLElement | null,
    private dv: () => DvApi,
    private app: () => App,
    private categoriesHolder: CategoriesHolder,
    private commentsHolder: AllCommentsHolder,
    private commentsPagesHolder: ValueNotifier<Record<string, any>[]>,
    private categoryScoreHolder: CategoryScoreHolder,
    private frontmatterManager: FrontmatterManager,
    private timeNoteHolder: TimeNoteHolder,
    private pagesHolder: ValueNotifier<Record<string, any>[]>
  ) {
    this.container = container ?? document.createElement("div");
    this.container.classList.add("lega4e-enter-category-widget");
    this.container.style.marginTop = "8px";
    this.setShownState();
  }

  attach() {
    this.commentsPagesHolder.state = this.dv().pages('"Diary/Daily"');

    const categories = this.categoriesHolder.state!.certainPack.categories;
    categories.sort((a, b) => {
      const scoreA = this.categoryScoreHolder.state?.[a.name] ?? 0;
      const scoreB = this.categoryScoreHolder.state?.[b.name] ?? 0;
      return scoreB - scoreA;
    });

    this.categoryAutocomplete = new InlineAutocomplete<Category>(
      this.app(),
      this.container!,
      {
        initialValue: "",
        placeholder: "Category...",
        width: "85px",
        suggestions: async () => categories,
        item2str: (item) => item.prettyName,
        item2suggestion: (item) =>
          item.prettyName +
          (this.categoryScoreHolder.state?.[item.name]
            ? ` (${this.categoryScoreHolder.state?.[item.name]})`
            : ""),
        inputEqualsItem: (input, item) =>
          input.toLocaleLowerCase() == item.prettyName.toLocaleLowerCase(),
        onSelect: (_) => {},
        onEnter: () => this.onButtonClick(),
      }
    );

    this.commentAutocomplete = new InlineAutocomplete<CommentWithCategory>(
      this.app(),
      this.container!,
      {
        initialValue: "",
        placeholder: "Comment...",
        width: "85px",
        suggestions: async () => this.commentsHolder.state,
        item2str: (item) => item.comment,
        item2suggestion: (item) =>
          item.comment +
          (item.categoryPrettyName && !this.categoryAutocomplete.value
            ? ` (${item.categoryPrettyName})`
            : ""),
        onSelect: (value) => {
          if (!this.categoryAutocomplete.value && value.categoryName) {
            this.categoryAutocomplete.value =
              this.categoriesHolder.state!.certainPack.categories.find(
                (category) => category.name == value.categoryName
              )!;
          }
        },
        str2item: (str) => ({
          comment: str,
          categoryName: null,
          categoryPrettyName: null,
        }),
        onEnter: () => this.onButtonClick(),
      }
    );

    this.minutesInput = new InputField(this.container!, {
      placeholder: "Time...",
      initialValue: "",
      width: "60px",
      onEnter: () => this.onButtonClick(),
    });

    this.confirmButton = this.makeButton(" ✍️ ", () => this.onButtonClick());
    this.container!.appendChild(this.confirmButton);
    this.makeButton(" 🗑 ", () => this.onTrashClick());

    this.container!.createEl("div", {
      cls: "lega4e-fast-buttons-separator",
    });

    const fastCats: { category: Category; text: string }[] =
      this.categoriesHolder
        .state!.fastButtonsCategories.map(({ category, text }) => ({
          category: this.categoriesHolder.state!.certainPack.categories.find(
            (c) => c.name == category
          )!,
          text: text,
        }))
        .filter(({ category }) => category);

    fastCats.forEach(({ text, category }) =>
      this.makeButton(text, () => {
        this.onButtonClick(category);
      })
    );
  }

  private makeButton(text: string, onClick: () => void): HTMLElement {
    const button = this.container!.createEl("button", {
      text: text,
      cls: "active",
      attr: {
        style: "margin: 4px;",
      },
    });
    button.addEventListener("click", () => onClick());
    return button;
  }

  private async onButtonClick(
    categoryOverride: Category | null = null
  ): Promise<void> {
    try {
      await this.frontmatterManager.addTimeEntry(
        this.app().workspace.getActiveFile()!,
        this.makeTimeEntry(categoryOverride)
      );

      setTimeout(() => this.updateTimeNote(), 500);
      this.categoryAutocomplete.value = null;
      this.commentAutocomplete.value = null;
      this.minutesInput.value = "";
    } catch (e) {
      new Notice(e?.message ?? e.toString(), 5000);
    }
  }

  private async onTrashClick(): Promise<void> {
    await this.frontmatterManager.removeLastTimeEntry(
      this.app().workspace.getActiveFile()!
    );

    setTimeout(() => this.updateTimeNote(), 500);
  }

  private makeTimeEntry(categoryOverride: Category | null): string {
    this.updateTimeNote();
    const category = categoryOverride ?? this.categoryAutocomplete.value;
    const comment = this.commentAutocomplete.value;
    let missingMinutes = this.timeNoteHolder.state!.missingMinutes!;

    const minutes = this.parseMinutesField();
    if (minutes) {
      switch (minutes.type) {
        case "+":
          missingMinutes += minutes.minutes;
          break;
        case "-":
          missingMinutes -= minutes.minutes;
          break;
        case "=":
          missingMinutes = minutes.minutes;
          break;
      }
    }

    if (missingMinutes <= 0) {
      throw new Error("Missing minutes must be positive");
    }
    if (category == null) {
      throw new Error("Category is not selected");
    }

    return ItemManager.formatEntry(
      category.prettyName,
      missingMinutes,
      comment?.comment
    );
  }

  private parseMinutesField(): {
    minutes: number;
    type: "+" | "-" | "=";
  } | null {
    const value = this.minutesInput.value;
    if (value.length == 0) {
      return null;
    }

    const match = value.match(/^([-+]?)(?:(\d+)ч\.?)?\s*(?:(\d+)м?\.?)?$/);
    console.log(match);
    if (!match) {
      throw new Error("Invalid minutes field");
    }

    return {
      minutes: parseInt(match[2] ?? "0") * 60 + parseInt(match[3] ?? "0"),
      type: match[1] == "-" ? "-" : match[1] == "+" ? "+" : "=",
    };
  }

  private updateTimeNote(): void {
    this.pagesHolder.state = [this.dv().current()];
    this.setShownState();
  }

  private setShownState() {
    const state = this.timeNoteHolder.state;
    this.container!.style.display =
      state.missingMinutes == null ||
      (state.missingMinutes == 0 &&
        state.minutesStart != null &&
        state.minutesEnd != null)
        ? "none"
        : "block";
  }
}
