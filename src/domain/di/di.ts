import { Container } from 'inversify';
import { TYPES } from './types';
import { CategoryManager } from 'src/features/categories/managers/category_manager';
import { CategoryPrinter } from 'src/features/categories/managers/category_printer';
import { CategoryCharts } from 'src/features/categories/managers/category_charts';
import { TableManager } from 'src/features/tables/table_manager';
import { ChartManager } from 'src/features/charts/chart_manager';
import { DiaryChartsManager } from 'src/features/diary_charts/diary_charts_manager';
import { DiaryPagesManager } from 'src/features/diary/diary_pages_manager';
import { ParamsPrinter } from 'src/features/params/params_printer';
import { ParamsManager } from 'src/features/params/params_manager';

const container = new Container();

// Managers
container.bind(TYPES.CategoryManager).to(CategoryManager).inSingletonScope();
container.bind(TYPES.CategoryPrinter).to(CategoryPrinter).inSingletonScope();
container.bind(TYPES.CategoryCharts).to(CategoryCharts).inSingletonScope();
container.bind(TYPES.TableManager).to(TableManager).inSingletonScope();
container.bind(TYPES.ChartManager).to(ChartManager).inSingletonScope();
container.bind(TYPES.DiaryChartsManager).to(DiaryChartsManager).inSingletonScope();
container.bind(TYPES.DiaryPagesManager).to(DiaryPagesManager).inSingletonScope();
container.bind(TYPES.ParamsPrinter).to(ParamsPrinter).inSingletonScope();
container.bind(TYPES.ParamsManager).to(ParamsManager).inSingletonScope();

// Options
container.bind<boolean>(TYPES.DiscardComments).toConstantValue(false);

// Paths
container.bind<string>(TYPES.CategoriesPath).toConstantValue('Categories.md');
container.bind<string>(TYPES.ParamsPath).toConstantValue('Params.md');

export { container };
