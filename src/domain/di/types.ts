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

  // Options
  DiscardComments: Symbol.for("DiscardComments"),

  // Paths
  CategoriesPath: Symbol.for("CategoriesPath"),
  ParamsPath: Symbol.for("ParamsPath"),
} as const;