import { ChartManager } from "src/features/charts/chart_manager";
import { formatMinutes, Item } from "../models/item";
import { Category } from "../models/category";
import { inject, injectable } from "inversify";
import { TYPES } from "src/domain/di/types";
import { CategoriesHolder } from "../state/categories_holder";
import { CategoryData, HistoryInfo } from "../models/interfaces";

@injectable()
export class CategoryCharts {
  constructor(
    @inject(TYPES.ChartManager) private charts: ChartManager,
    @inject(TYPES.CategoriesHolder) private categoriesHolder: CategoriesHolder,
  ) {}

  /**
   * Возвращает HTMLElement с построенной диаграммой.
   * @param chartInfo Кортеж, где первый элемент – агрегированные данные (root), второй – массив элементов Item.
   * @param otherCategory Объект категории "Прочее", используемый для компенсации.
   * @returns HTMLElement, содержащий диаграмму.
   */
  public makePieChart(
    chartInfo: CategoryData,
    otherCategory: Category,
  ): HTMLElement {
    const { root, items } = chartInfo;

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

    canvas.height = 350;
    canvas.width = 350;
    canvas.style.width = "350px";
    canvas.style.height = "350px";

    // Оборачиваем полученный элемент в div с нужными стилями
    const chartContainer = document.createElement("div");
    chartContainer.className = "category-pie-chart";
    chartContainer.style.width = "350px";
    chartContainer.style.height = "350px";
    chartContainer.appendChild(canvas);

    return chartContainer;
  }

  makeLineChart(chartInfo: HistoryInfo): HTMLElement {
    const items = chartInfo.map(({ items }) => items).flat();
    const categories = items.map((item) => item.category!.name!).unique();

    const units = categories.map((category) => ({
      label: category,
      values: chartInfo.map(
        ({ date, items }) =>
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
      (category, value, dates) => {
        let info = chartInfo.filter(({ date }) => dates.includes(date));

        let items = Item.aggregate(
          info
            .map(({ items }) => items)
            .flat()
            .filter((item) => item.category!.name == category)
            .map((item) => item.leafs())
            .flat(),
          this.categoriesHolder.value?.discardComments,
        );

        return items.length > 0
          ? this._item2tip(value, info[0].root.totalMinutes, items)
          : [category];
      },
      60,
      formatMinutes,
      15,
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
        .flatMap((item) =>
          item.prettyLeafs(this.categoriesHolder.value?.discardComments),
        )
        .sort((a, b) => b.totalMinutes - a.totalMinutes)
        .map(
          (c) =>
            c.category!.name! +
            (this.categoriesHolder.value?.discardComments &&
            c.comment &&
            c.comment != ""
              ? ` (${c.comment})`
              : "") +
            " " +
            c.pretty(),
        ),
    ];
  }
}