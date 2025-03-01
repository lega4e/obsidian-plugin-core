import { CategoriesConfigHolder } from "src/features/categories/state/categories_config_holder";
import { CategoriesHolder } from "src/features/categories/state/categories_holder";
import { CategoryCharts } from "src/features/categories/managers/category_charts";
import { CategoryManager } from "src/features/categories/managers/category_manager";
import { CategoryPrinter } from "src/features/categories/managers/category_printer";
import { ChartManager } from "src/features/charts/chart_manager";
import { Container } from "inversify";
import { DiaryChartsManager } from "src/features/diary_charts/diary_charts_manager";
import { DiaryPagesManager } from "src/features/diary/diary_pages_manager";
import { ParamsConfigHolder } from "src/features/params/models/params_config_holder";
import { ParamsManager } from "src/features/params/params_manager";
import { ParamsPrinter } from "src/features/params/params_printer";
import { TYPES } from "./types";
import { TableManager } from "src/features/tables/table_manager";
import { ValueNotifier } from "src/utils/value_notifier";

const container = new Container();

// Managers
container.bind(TYPES.CategoryManager).to(CategoryManager).inSingletonScope();
container.bind(TYPES.CategoryPrinter).to(CategoryPrinter).inSingletonScope();
container.bind(TYPES.CategoryCharts).to(CategoryCharts).inSingletonScope();
container.bind(TYPES.TableManager).to(TableManager).inSingletonScope();
container.bind(TYPES.ChartManager).to(ChartManager).inSingletonScope();
container
  .bind(TYPES.DiaryChartsManager)
  .to(DiaryChartsManager)
  .inSingletonScope();
container
  .bind(TYPES.DiaryPagesManager)
  .to(DiaryPagesManager)
  .inSingletonScope();
container.bind(TYPES.ParamsPrinter).to(ParamsPrinter).inSingletonScope();
container.bind(TYPES.ParamsManager).to(ParamsManager).inSingletonScope();

// Paths
container
  .bind<ValueNotifier<string>>(TYPES.CategoriesPathHolder)
  .toConstantValue(new ValueNotifier<string>(""));
container
  .bind<ValueNotifier<string>>(TYPES.ParamsPathHolder)
  .toConstantValue(new ValueNotifier<string>(""));

// Configs
container
  .bind(TYPES.CategoriesConfigHolder)
  .to(CategoriesConfigHolder)
  .inSingletonScope();
container
  .bind(TYPES.ParamsConfigHolder)
  .to(ParamsConfigHolder)
  .inSingletonScope();
container
  .bind(TYPES.CategoriesHolder)
  .to(CategoriesHolder)
  .inSingletonScope();

export { container };