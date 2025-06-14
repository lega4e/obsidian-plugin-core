export const a = 0;

// import DvApi from "src/domain/interfaces/dv_api";
// import CategoryPrinter from "../categories/printers/category_printer";
// import ParamsPrinter from "../params/params_printer";
// import TabsLayoutWidget from "src/ui/tabs/tab_layout_widget";

// export class DiaryChartsManager {
//   constructor(
//     private dv: () => DvApi,
//     private paramsPrinter: ParamsPrinter,
//     private categoryPrinter: CategoryPrinter
//   ) {}

//   buildCharts(pages: Record<string, any>[]): void {
//     this.paramsPrinter.loadParams(pages);
//     const paramsChart = this.paramsPrinter.getChart();
//     this.paramsPrinter.clearParams();

//     this.categoryPrinter.loadPages(
//       pages,
//       ["sub", "common"],
//       ["common", "global"],
//       ["common", "global"]
//     );

//     const categoryCharts = this.categoryPrinter
//       .getCharts()
//       .map((chart) => chart.chart);
//     const historyCharts = this.categoryPrinter.getHistoryCharts();
//     const table = this.categoryPrinter.getTable();
//     const tableAvg = this.categoryPrinter.getTable(true);
//     this.categoryPrinter.clearPages();

//     const widget = new TabsLayoutWidget(undefined, [
//       ...categoryCharts.map((chart, index) => ({
//         title: ["Общие категории", "Обобщённые"][index],
//         content: () => chart,
//         setAttrsToTabContent: (tabContent: HTMLElement) => {
//           tabContent.style.height = "350px";
//           tabContent.style.width = "350px";
//         },
//       })),
//       ...historyCharts.map((chart, index) => ({
//         title: ["История", "История обобщённая"][index],
//         content: () => chart,
//       })),
//       {
//         title: "Параметры",
//         content: () => paramsChart,
//       },
//       {
//         title: "Таблица",
//         content: () => table,
//       },
//       {
//         title: "Таблица (ср)",
//         content: () => tableAvg,
//       },
//     ]);
//     this.dv().el("div", widget.container);
//   }
// }
