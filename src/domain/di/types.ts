export type DicardCommentsHolder = {
  value: boolean;
}

export const TYPES = {
  // External
  DvApi: "DvApi",

  // Managers
  CategoryManager: Symbol.for("CategoryManager"),
  CategoryPrinter: Symbol.for("CategoryPrinter"),
  CategoryCharts: Symbol.for("CategoryCharts"),
  TableManager: Symbol.for("TableManager"),
  ChartManager: Symbol.for("ChartManager"),
  DiaryChartsManager: Symbol.for("DiaryChartsManager"),
  DiaryPagesManager: Symbol.for("DiaryPagesManager"),
  ParamsPrinter: Symbol.for("ParamsPrinter"),
  ParamsManager: Symbol.for("ParamsManager"),

  // Paths
  CategoriesPathHolder: Symbol.for("CategoriesPathHolder"),
  ParamsPathHolder: Symbol.for("ParamsPathHolder"),

  // Configs
  CategoriesConfigHolder: Symbol.for("CategoriesConfigHolder"),
  ParamsConfigHolder: Symbol.for("ParamsConfigHolder"),
  CategoriesHolder: Symbol.for("CategoriesHolder"),
} as const;