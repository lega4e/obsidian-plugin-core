import { DvApi } from "src/domain/interfaces/dv_api";
import { CategoryManager } from "./category_manager";
import { formatMinutes, Item } from "../models/item";
import { CategoryCharts } from "./category_charts";
import { TabsLayoutWidget } from "src/ui/tabs/tab_layout_widget";

export class CategoryPrinter {
  private dv: DvApi;
  private manager: CategoryManager;
  private charts: CategoryCharts;
  private infoPacks: [Item, Item[]][] | null = null;
  private totalIntervalTime: number | null = null;
  private chartInfo: [Item, Item[]][] | null = null;
  private historyInfo: [string, [Item, Item[]]][][] = [];

  constructor(
    dv: DvApi,
    categoriesPath: string,
    manager: CategoryManager | undefined = undefined,
    charts: CategoryCharts | undefined = undefined,
  ) {
    this.dv = dv;
    this.manager = manager ?? new CategoryManager(dv, categoriesPath);
    this.charts = charts ?? new CategoryCharts();
    this.charts.discardComments = this.manager.discardComments;
  }

  loadPages(
    pages: Record<string, any>[],
    packTypes: string[],
    chartPackTypes: string[],
    historyPackTypes?: string[],
  ): void {
    this.manager.loadPages(pages);
    this.infoPacks = packTypes.map((packType: string) =>
      this.manager.calculate(packType),
    );

    if (historyPackTypes && historyPackTypes.length > 0) {
      this.historyInfo = historyPackTypes.map((packType: string) =>
        this.manager.calculateArray(
          packType,
          pages.map((page) => page.file.name),
        ),
      );
    } else {
      this.historyInfo = [];
    }

    this.totalIntervalTime = this._calcTotalIntervalTime(pages);

    if (chartPackTypes) {
      this.chartInfo = chartPackTypes.map((packType) => {
        let info = this.manager.calculate(packType);
        if (!info) {
          throw new Error("Info pack with type " + packType + " not found");
        }

        let [root, items] = info;
        let totalMinutes =
          root.totalMinutes -
          items
            .filter((item) => item.category!.skipOnDiagramm)
            .reduce((acc, curr) => acc + curr.totalMinutes, 0);
        root.totalMinutes = totalMinutes;
        items = items.filter((item) => !item.category!.skipOnDiagramm);
        return [root, items];
      });
    } else {
      this.chartInfo = [];
    }
  }

  clearPages(): void {
    this.manager.clearPages();
    this.infoPacks = null;
    this.totalIntervalTime = null;
    this.chartInfo = [];
    this.historyInfo = [];
  }

  checkCanBuild(pages: Record<string, any>[]): boolean {
    const entries = pages.filter(
      (page) =>
        page["Времяучёт"] != null &&
        Array.isArray(page["Времяучёт"]) &&
        page["Времяучёт"].length != 0,
    );

    return entries.length > 0;
  }

  buildTable(): void {
    if (this.infoPacks == null) {
      throw new Error("Info packs not loaded");
    }

    const titles = this.infoPacks
      .map((info) => [info[0].category?.name!, "Время"])
      .reduce((acc, curr) => acc.concat(curr), []);
    const rowsPack = this.infoPacks.map((info) => info[1]);

    const rows = [];
    for (
      let i = 0;
      i < Math.max(...rowsPack.map((items) => items.length));
      i++
    ) {
      rows.push(
        rowsPack
          .map((items) =>
            items[i]
              ? [
                  items[i].category?.name!,
                  this._item2tip(
                    items[i].totalMinutes,
                    this.infoPacks![0][0].totalMinutes,
                  ),
                ]
              : ["", ""],
          )
          .flat(),
      );
    }

    const info = this.infoPacks[0];

    this.dv.table(titles, rows);

    if (info[0].totalMinutes == null) {
      return;
    } else if (this.totalIntervalTime == null) {
      this.dv.span(`Итого: ${info[0].pretty()}`);
      return;
    } else {
      this.dv.span(
        `Итого: ${info[0].pretty()}\nДолжно: ${formatMinutes(this.totalIntervalTime)}` +
          (info[0].totalMinutes < this.totalIntervalTime
            ? `\nНехватка: ${formatMinutes(this.totalIntervalTime - info[0].totalMinutes)}`
            : this.totalIntervalTime == info[0].totalMinutes
              ? "Тютелька в тютельку"
              : `\nИзбыток: ${formatMinutes(info[0].totalMinutes - this.totalIntervalTime)}`),
      );
    }
  }

  buildChart(): void {
    if (!this.chartInfo || this.chartInfo[0][1].length == 0) {
      this.dv.paragraph("\nНет данных для построения диаграммы...");
      return;
    }

    if (this.chartInfo.length == 1) {
      this.dv.el("div", this.getCharts()[0][1]);
    } else {
      const widget = new TabsLayoutWidget(
        undefined,
        this.chartInfo.map((info, i) => ({
          title: info[0].category!.name!,
          content: () =>
            this.charts.makePieChart(info, this.manager.getOtherCategory()),
        })),
      );
      this.dv.el("div", widget.container);
    }
  }

  buildHistoryChart(): void {
    if (!this.historyInfo || this.historyInfo.length === 0) {
      this.dv.paragraph("\nНет данных для построения графика истории...");
      return;
    }

    if (this.historyInfo.length === 1) {
      this.dv.el("div", this.charts.makeLineChart(this.historyInfo[0]));
    } else {
      const widget = new TabsLayoutWidget(
        undefined,
        this.historyInfo.map((history, i) => ({
          title: history[0][0] || `История ${i + 1}`,
          content: () => this.charts.makeLineChart(history),
        })),
      );
      this.dv.el("div", widget.container);
    }
  }

  getCharts(): [string, HTMLElement][] {
    if (this.chartInfo == null) {
      return [];
    }

    return this.chartInfo.map((info) => [
      info[0].category!.name!,
      this.charts.makePieChart(info, this.manager.getOtherCategory()),
    ]);
  }

  getHistoryCharts(): HTMLElement[] {
    if (this.historyInfo == null || this.historyInfo.length === 0) {
      return [];
    }

    return this.historyInfo.map((history) =>
      this.charts.makeLineChart(history),
    );
  }

  private _calcTotalIntervalTime(pages: Record<string, any>[]): number | null {
    let value = pages
      .map((page) => this._calcDailyTotalTime(page))
      .reduce((acc, curr) => (acc ?? 0) + (curr ?? 0), 0);

    return value == 0 ? null : value;
  }

  private _calcDailyTotalTime(page: Record<string, any>): number | null {
    function timeToMinutes(time: string | null): number | null {
      if (time == null || time.trim() == "") {
        return null;
      }

      let [hours, minutes] = time.split(":").map(Number);
      return hours * 60 + minutes;
    }

    let start = timeToMinutes(page["Подъём"]);
    let end = timeToMinutes(page["Отбой"]);

    if (start == null || end == null) {
      return null;
    }

    if (end < start) {
      end += 24 * 60;
    }

    return end - start;
  }

  private _item2tip(value: number, totalMinutes: number): string {
    return (
      formatMinutes(value) +
      "; " +
      ((value / totalMinutes) * 100).toFixed(1).replace(".", ",") +
      "%"
    );
  }
}