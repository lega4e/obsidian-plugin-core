import CategoriesConfigHolder from "src/features/categories/state/categories_config_holder";
import ChartManager from "src/features/charts/chart_manager";
import ParamsConfigHolder from "src/features/params/states/params_config_holder";
import ParamsManager from "src/features/params/params_manager";
import ParamsPrinter from "src/features/params/params_printer";
import ValueNotifier from "src/utils/notifiers/value_notifier";
import TabsPrinter from "src/features/tabs_printer/tabs_printer";
import TabsConfigHolder from "src/features/tabs_printer/states/tabs_config_holder";
import CalculatedParamsHolder from "src/features/params/states/calculated_params_holder";
import DvApi from "../interfaces/dv_api";
import CategoryPrinter from "src/features/categories/printers/category_printer";
import CategoriesHolder from "src/features/categories/state/categories_holder";
import CategoryCharts from "src/features/categories/managers/category_charts";
import CalculatedCategoriesHolder from "src/features/categories/state/calculated_categories_holder";
import CalculatedItemHolder from "src/features/categories/state/calculated_item_holder";
import DerivedValueNotifier from "src/utils/notifiers/derived_notifier";
import DiaryPagesManager from "src/features/diary/diary_pages_manager";
import TimeNotePrinter from "src/features/categories/printers/time_note_printer";
import TimeNoteHolder from "src/features/categories/state/time_note_holder";
import Api from "src/features/api/api";
import { App } from "obsidian";
import AllCommentsHolder from "src/features/categories/state/all_comments_holder";
import CommentsAndCategoryScoreHolder from "src/features/categories/state/comments_and_category_score_holder";
import CategoryScoreHolder from "src/features/categories/state/category_score_holder";
import FrontmatterManager from "src/features/categories/managers/frontmatter_manager";
import LazyDerivedValueNotifier from "src/utils/notifiers/lazy_derived_notifier";
import FileObserver from "src/library/obsidian/FileObserver";

export default class Di {
  app: App | null = null;
  dv: DvApi | null = null;

  // CONFIG
  paramsConfigFileNameHolder = new ValueNotifier<string>("");
  categoriesConfigFileNameHolder = new ValueNotifier<string>("");
  tabsConfigFileNameHolder = new ValueNotifier<string>("");

  paramsConfigHolder = new ParamsConfigHolder(
    () => this.dv!,
    () => this.app!,
    this.paramsConfigFileNameHolder
  );

  categoriesConfigHolder = new CategoriesConfigHolder(
    () => this.dv!,
    () => this.app!,
    this.categoriesConfigFileNameHolder
  );

  tabsConfigHolder = new TabsConfigHolder(
    () => this.dv!,
    () => this.app!,
    this.tabsConfigFileNameHolder
  );

  fileObserver = new FileObserver(
    () => this.app!,
    [
      {
        filename: () => this.paramsConfigFileNameHolder.state,
        onModify: () => this.paramsConfigHolder.update(),
      },
      {
        filename: () => this.categoriesConfigFileNameHolder.state,
        onModify: () => this.categoriesConfigHolder.update(),
      },
      {
        filename: () => this.tabsConfigFileNameHolder.state,
        onModify: () => this.tabsConfigHolder.update(),
      },
    ]
  );

  // PAGES
  pagesHolder = new ValueNotifier<Record<string, any>[]>([]);
  commentPagesHolder = new ValueNotifier<Record<string, any>[]>([]);

  paramPagesHolder = new DerivedValueNotifier<Record<string, any>[]>(
    [this.pagesHolder],
    () => this.pagesHolder.state
  );
  previousParamPagesHolder = new ValueNotifier<Record<string, any>[]>([]);
  nextParamPagesHolder = new ValueNotifier<Record<string, any>[]>([]);

  categoryPagesHolder = new DerivedValueNotifier<Record<string, any>[]>(
    [this.pagesHolder],
    () => this.pagesHolder.state
  );

  // SERVICE
  chartsManager = new ChartManager();

  diaryPagesManager = new DiaryPagesManager(() => this.dv!);

  // PARAMS
  paramsManager = new ParamsManager(this.paramsConfigHolder);

  calculatedParamsHolder = new CalculatedParamsHolder(
    this.paramsManager,
    this.paramPagesHolder
  );

  previousCalculatedParamsHolder = new CalculatedParamsHolder(
    this.paramsManager,
    this.previousParamPagesHolder
  );

  nextCalculatedParamsHolder = new CalculatedParamsHolder(
    this.paramsManager,
    this.nextParamPagesHolder
  );

  paramsPrinter = new ParamsPrinter(
    () => this.dv!,
    this.chartsManager,
    this.calculatedParamsHolder,
    this.previousCalculatedParamsHolder,
    this.nextCalculatedParamsHolder
  );

  // CATEGORIES
  categoriesHolder = new CategoriesHolder(this.categoriesConfigHolder);

  categoryChartsManager = new CategoryCharts(this.chartsManager);

  itemsHolder = new CalculatedItemHolder(
    this.categoryPagesHolder,
    this.categoriesHolder
  );

  commentsAndCategoryScoreHolder = new CommentsAndCategoryScoreHolder(
    this.commentPagesHolder,
    this.categoriesHolder
  );

  categoryScoreHolder = new CategoryScoreHolder(
    this.commentsAndCategoryScoreHolder
  );

  commentsHolder = new AllCommentsHolder(this.commentsAndCategoryScoreHolder);

  calculatedCategoriesParamsSource = new ValueNotifier<string | undefined>(
    undefined
  );

  calculatedCategoriesHolder = new CalculatedCategoriesHolder(
    this.categoriesHolder,
    this.itemsHolder,
    this.calculatedCategoriesParamsSource,
    this.tabsConfigHolder
  );

  categoriesPrinter = new CategoryPrinter(
    () => this.dv!,
    this.categoryChartsManager,
    this.categoryPagesHolder,
    this.categoriesHolder,
    this.calculatedCategoriesHolder
  );

  // TIME NOTES
  timeNoteHolder = new TimeNoteHolder(
    this.itemsHolder,
    this.categoryPagesHolder
  );

  timeNotePrinter = new TimeNotePrinter(
    () => this.dv!,
    this.timeNoteHolder,
    this.categoryPagesHolder
  );

  // COMMON
  tabsPrinter = new TabsPrinter(
    () => this.dv!,
    this.tabsConfigHolder,
    this.paramsPrinter,
    this.categoriesPrinter
  );

  frontmatterManager = new FrontmatterManager(
    () => this.app!,
    new LazyDerivedValueNotifier<string | null>(
      [this.categoriesConfigHolder],
      () => this.categoriesConfigHolder.state?.options.itemsFieldName ?? null
    ),
    this.categoriesHolder
  );

  // API
  api = new Api(
    () => this.dv!,
    () => this.app!,
    this.diaryPagesManager,
    this.tabsPrinter,
    this.timeNotePrinter,
    this.categoriesPrinter,
    this.paramsPrinter,
    this.pagesHolder,
    this.paramPagesHolder,
    this.previousParamPagesHolder,
    this.nextParamPagesHolder,
    this.categoriesHolder,
    this.commentsHolder,
    this.commentPagesHolder,
    this.categoryScoreHolder,
    this.frontmatterManager,
    this.timeNoteHolder,
    this.calculatedCategoriesParamsSource
  );
}
