import { ChartManager } from "src/features/charts/chart_manager";
import { formatMinutes, Item } from "../models/item";
import { Category } from "../models/category";

export class CategoryCharts {
  private charts: ChartManager;

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
        tip: this._item2tip(item.totalMinutes, root.totalMinutes),
      })),
      {
        label: otherCategory.name,
        value: 0,
        color: otherCategory.color!,
        tip: (value: number) => this._item2tip(value, root.totalMinutes),
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

  /**
   * Форматирует значение в виде строки с процентным соотношением.
   * @param value значение для форматирования.
   * @param totalMinutes общее значение для вычисления процента.
   * @returns Строка с отформатированным значением и процентом.
   */
  private _item2tip(value: number, totalMinutes: number): string {
    return (
      formatMinutes(value) +
      "; " +
      ((value / totalMinutes) * 100).toFixed(1).replace(".", ",") +
      "%"
    );
  }
}