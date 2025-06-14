import DiaryPagesManager from "src/features/diary/diary_pages_manager";
import TabsPrinter from "src/features/tabs_printer/tabs_printer";
import TimeNotePrinter from "src/features/categories/printers/time_note_printer";
import CategoryPrinter from "src/features/categories/printers/category_printer";
import ParamsPrinter from "src/features/params/params_printer";
import ValueNotifier from "src/utils/notifiers/value_notifier";
import DerivedValueNotifier from "src/utils/notifiers/derived_notifier";

export default class Api {
  constructor(
    private diaryPagesManager: DiaryPagesManager,
    private tabsPrinter: TabsPrinter,
    private timeNotePrinter: TimeNotePrinter,
    private categoriesPrinter: CategoryPrinter,
    private paramsPrinter: ParamsPrinter,
    private pagesHolder: ValueNotifier<Record<string, any>[]>,
    private paramPagesHolder: DerivedValueNotifier<Record<string, any>[]>,
    private previousParamPagesHolder: ValueNotifier<Record<string, any>[]>,
    private nextParamPagesHolder: ValueNotifier<Record<string, any>[]>
  ) {}

  // PAGES
  setCategoryPages(pages: Record<string, any>[]): void {
    this.pagesHolder.state = pages;
  }

  setParamPages(
    pages: Record<string, any>[],
    prevPages?: Record<string, any>[],
    nextPages?: Record<string, any>[]
  ): void {
    this.paramPagesHolder.state = pages;
    this.previousParamPagesHolder.state = prevPages ?? [];
    this.nextParamPagesHolder.state = nextPages ?? [];
  }

  // TABS
  buildTabs(packId: string): void {
    this.tabsPrinter.buildTabs(packId);
  }

  // DIARY PAGES
  get diaryPages(): DiaryPagesManager {
    return this.diaryPagesManager;
  }

  // TIME NOTE
  buildTimeNote(little: boolean = false, dayTime: boolean = false): void {
    this.timeNotePrinter.buildTimeNote(little, dayTime);
  }

  // CATEGORIES
  buildCategoriesTable(packTypes: string[], avg: boolean = false): void {
    this.categoriesPrinter.buildTable(packTypes, avg);
  }

  makeCategoriesTable(
    packTypes: string[],
    avg: boolean = false
  ): {
    titles: string[];
    rows: string[][];
  } {
    return this.categoriesPrinter.makeTable(packTypes, avg);
  }

  makeCategoriesPieChart(packType: string): HTMLElement {
    return this.categoriesPrinter.makePieChart(packType);
  }

  makeCategoriesLineChart(packType: string): HTMLElement {
    return this.categoriesPrinter.makeLineChart(packType);
  }

  // PARAMS
  makeParamsChart(): HTMLElement {
    return this.paramsPrinter.makeChart();
  }

  buildParamsAveragesTable(): void {
    this.paramsPrinter.buildAveragesTable();
  }
}
