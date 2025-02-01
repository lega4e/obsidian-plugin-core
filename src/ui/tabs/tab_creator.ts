import { DvApi } from "src/domain/interfaces/dv_api";
import { TabData, TabsLayoutWidget } from "./tab_layout_widget";
import { ChartManager } from "src/features/charts/chart_manager";

export class TabCreator {
  private dv: DvApi;
  private charts: ChartManager;

  constructor(dv: DvApi, charts?: ChartManager) {
    this.dv = dv;
    this.charts = charts ?? new ChartManager();
  }

  createTabs(): void {
    this.dv.el("div", "Содержимое", {
      cls: "my-class",
      attr: { id: "tabs-container-id" },
    });
    const el = document.getElementById("tabs-container-id");

    if (!el) {
      throw new Error("Can't create tabs container");
    }

    const tabWidget = new TabsLayoutWidget(el, [
      this._createTab("Title1", "Content1"),
      this._createTab("Title2", "Content2"),
      this._createTab("Title3", "Content3"),
    ]);
  }

  private _createTab(title: string, content: string): TabData {
    return {
      title,
      content: () => {
        return this.charts.pie([
          {
            label: content,
            value: 0,
            color: "#000",
            tip: (value: number) => `${value} минут`,
          },
          {
            label: "Категория 1",
            value: 25,
            color: "#FF5733",
            tip: (value: number) => `${value} минут`,
          },
          {
            label: "Категория 2",
            value: 40,
            color: "#33FF57",
            tip: (value: number) => `${value} минут`,
          },
          {
            label: "Категория 3",
            value: 15,
            color: "#3357FF",
            tip: (value: number) => `${value} минут`,
          },
          {
            label: "Категория 4",
            value: 35,
            color: "#FF33F6",
            tip: (value: number) => `${value} минут`,
          },
          {
            label: "Категория 5",
            value: 30,
            color: "#33FFF3",
            tip: (value: number) => `${value} минут`,
          },
        ]);
      },
    };
  }
}