import { ChartManager } from "src/features/charts/chart_manager";
import { formatMinutes, Item } from "../models/item";
import { Category } from "../models/category";

export class CategoryCharts {
  private charts: ChartManager;
  public discardComments: boolean = false;

  /**
   * Конструктор:
   * @param charts опционально, если не передан, создаётся новый ChartManager.
   */
  constructor(charts?: ChartManager) {
    this.charts = charts || new ChartManager();
  }

  /**
   * Возвращает HTMLElement с построенной диаграммой.
   * @param chartInfo Кортеж, где первый элемент – агрегированные данные (root), второй – массив элементов Item.
   * @param otherCategory Объект категории "Прочее", используемый для компенсации.
   * @returns HTMLElement, содержащий диаграмму.
   */
  public makePieChart(
    chartInfo: [Item, Item[]],
    otherCategory: Category,
  ): HTMLElement {
    const [root, items] = chartInfo;

    // Создаем диаграмму через ChartManager. Метод pie возвращает элемент canvas или подобный.
    const canvas = this.charts.pie(
      items.map((item) => ({
        label: item.category!.name!,
        value: item.totalMinutes,
        color: item.category!.color!,
        tip: this._item2tip(item.totalMinutes, root.totalMinutes, [item]),
      })),
      {
        label: otherCategory.name,
        value: 0,
        color: otherCategory.color!,
        tip: (value: number, labels?: string[]) =>
          this._item2tip(
            value,
            root.totalMinutes,
            Array.from(
              labels?.map(
                (label) => items.find((item) => item.category!.name == label)!,
              ) ?? [],
            ),
          ),
      },
    );

    // Оборачиваем полученный элемент в div с нужными стилями
    const chartContainer = document.createElement("div");
    chartContainer.className = "category-pie-chart";
    chartContainer.style.maxWidth = "380px";
    chartContainer.style.maxHeight = "380px";
    chartContainer.style.width = "100%";
    chartContainer.style.height = "100%";
    chartContainer.appendChild(canvas);

    return chartContainer;
  }

  makeLineChart(chartInfo: [string, [Item, Item[]]][]): HTMLElement {
    const items = chartInfo.map(([_, [__, items]]) => items).flat();
    const categories = items.map((item) => item.category!.name!).unique();

    const units = categories.map((category) => ({
      label: category,
      values: chartInfo.map(
        ([date, [_, items]]) =>
          [
            date,
            items.find((item) => item.category!.name == category)
              ?.totalMinutes ?? 0,
          ] as [string, number],
      ),
      color: items.find((item) => item.category?.name == category)!.category!
        .color!,
      hidden: items.find((item) => item.category?.name == category)!.category!
        .hideOnLineChart,
    }));

    const canvas = this.charts.line(
      units,
      undefined,
      undefined,
      (category, value, date) => {
        let info = chartInfo.find(([key, _]) => key == date);
        if (!info) {
          return [category];
        }

        let [root, items] = info[1];
        let item = items.find((item) => item.category!.name == category);
        return item
          ? this._item2tip(value, root.totalMinutes, [item])
          : [category];
      },
      60,
      formatMinutes,
    );

    const chartContainer = document.createElement("div");
    chartContainer.className = "category-line-chart";
    chartContainer.style.maxHeight = "380px";
    chartContainer.style.width = "100%";
    chartContainer.style.height = "100%";
    chartContainer.appendChild(canvas);

    return chartContainer;
  }

  /**
   * Форматирует значение в виде строки с процентным соотношением.
   * @param value значение для форматирования.
   * @param totalMinutes общее значение для вычисления процента.
   * @returns Строка с отформатированным значением и процентом.
   */
  private _item2tip(
    value: number,
    totalMinutes: number,
    items: Item[],
  ): string[] {
    return [
      formatMinutes(value) +
        "; " +
        ((value / totalMinutes) * 100).toFixed(1).replace(".", ",") +
        "%",
      ...items
        .flatMap((item) => item.prettyLeafs(this.discardComments))
        .sort((a, b) => b.totalMinutes - a.totalMinutes)
        .map(
          (c) =>
            c.category!.name! +
            (this.discardComments && c.comment && c.comment != ""
              ? ` (${c.comment})`
              : "") +
            " " +
            c.pretty(),
        ),
    ];
  }
}