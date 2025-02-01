import { DvApi } from "src/domain/interfaces/dv_api";
import { CategoryPrinter } from "../categories/managers/category_printer";
import { ParamsPrinter } from "../params/params_printer";
import { TabsLayoutWidget } from "src/ui/tabs/tab_layout_widget";

export class DiaryChartsManager {
  private paramsPrinter: ParamsPrinter;
  private categoryPrinter: CategoryPrinter;
  private dv: DvApi;

  constructor(dv: DvApi, paramsFile: string, categoriesPath: string) {
    this.dv = dv;
    this.paramsPrinter = new ParamsPrinter(dv, paramsFile);
    this.categoryPrinter = new CategoryPrinter(dv, categoriesPath);
  }

  buildCharts(
    pages: Record<string, any>[],
    chartCategoryTypes: string[],
  ): void {
    this.paramsPrinter.loadParams(pages);
    const paramsChart = this.paramsPrinter.getChart();
    this.paramsPrinter.clearParams();

    this.categoryPrinter.loadPages(pages, [], chartCategoryTypes);
    const categoryCharts = this.categoryPrinter.getCharts();
    this.categoryPrinter.clearPages();

    const widget = new TabsLayoutWidget(undefined, [
      {
        title: "Параметры",
        content: () => paramsChart,
      },
      ...categoryCharts.map(([name, chart]) => ({
        title: { Общие: "Общие категории", Категории: "Подкатегории" }[name]!,
        content: () => chart,
      })),
    ]);
    this.dv.el("div", widget.container);
  }
}