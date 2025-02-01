import { DvApi } from "src/domain/interfaces/dv_api";
import { CategoryManager } from "./category_manager";
import { formatMinutes, Item } from "../models/item";
import {
  ChartManager,
  PieChartDataUnit,
} from "src/features/charts/chart_manager";

export class CategoryPrinter {
  private dv: DvApi;
  private manager: CategoryManager;
  private charts: ChartManager;
  private infoPacks: [Item, Item[]][] | null = null;
  private totalIntervalTime: number | null = null;
  private chartInfo: [Item, Item[]] | null = null;

  constructor(
    dv: DvApi,
    categoriesPath: string,
    manager: CategoryManager | undefined = undefined,
    charts: ChartManager | undefined = undefined,
  ) {
    this.dv = dv;
    this.manager = manager ?? new CategoryManager(dv, categoriesPath);
    this.charts = charts ?? new ChartManager();
  }

  loadPages(
    pages: Record<string, any>[],
    packTypes: string[],
    chartPackType: string | null = null,
  ): void {
    this.infoPacks = packTypes.map((packType) =>
      this.manager.calculate(pages, packType),
    );
    this.totalIntervalTime = this._calcTotalIntervalTime(pages);

    if (chartPackType) {
      let [root, items] = this.infoPacks[packTypes.indexOf(chartPackType)];
      let totalMinutes =
        root.totalMinutes -
        items
          .filter((item) => item.category!.skipOnDiagramm)
          .reduce((acc, curr) => acc + curr.totalMinutes, 0);
      root.totalMinutes = totalMinutes;
      items = items.filter((item) => !item.category!.skipOnDiagramm);
      this.chartInfo = [root, items];
    } else {
      this.chartInfo = null;
    }
  }

  clearPages(): void {
    this.infoPacks = null;
    this.totalIntervalTime = null;
    this.chartInfo = null;
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
                  this._item2tip(items[i].totalMinutes, this.infoPacks![0][0].totalMinutes),
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

  buildChart(): void {
    if (!this.chartInfo || this.chartInfo[1].length == 0) {
      this.dv.paragraph("\nНет данных для построения диаграммы...");
      return;
    }

    let [root, items] = this.chartInfo;
    let otherCategory = this.manager.getOtherCategory();

    this.charts.pie(
      items.map((item) => ({
        label: item.category!.name!,
        value: item.totalMinutes,
        color: item.category!.color!,
        tip: this._item2tip(item.totalMinutes, root.totalMinutes),
      })),
      {
        label: otherCategory.name,
        value: 0,
        color: otherCategory.color!,
        tip: (value: number) => this._item2tip(value, root.totalMinutes),
      },
      (canvas) =>
        this.dv.el("div", canvas, {
          cls: "my-custom-class",
          attr: {
            style: "max-width: 500px; width: 100%;",
          },
        }),
    );
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