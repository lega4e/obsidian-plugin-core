import ChartManager, {
  LineChartDataUnit,
} from "src/features/charts/chart_manager";
import { formatMinutes } from "../models/item";
import Category from "../models/category";
import {
  CalculatedCategory,
  CalculatedCategoryDated,
} from "../state/calculated_categories_holder";

export default class CategoryCharts {
  constructor(private charts: ChartManager) {}

  /**
   * Возвращает HTMLElement с построенной диаграммой.
   * @param chartInfo Кортеж, где первый элемент – агрегированные данные (root), второй – массив элементов Item.
   * @param otherCategory Объект категории "Прочее", используемый для компенсации.
   * @returns HTMLElement, содержащий диаграмму.
   */
  public makePieChart(
    categories: CalculatedCategory[],
    otherCategory: Category
  ): HTMLElement {
    if (categories.length == 0) {
      const div = document.createElement("div");
      div.innerHTML = "Времяучёт не заполнен";
      return div;
    }

    const totalMinutes = categories.reduce(
      (acc, cat) => acc + cat.totalMinutes,
      0
    );

    const canvas = this.charts.pie(
      categories.map((cat) => ({
        label: cat.prettyName,
        value: cat.totalMinutes,
        color: cat.color,
        tip: this.category2tip(cat.totalMinutes, totalMinutes, [cat]),
      })),
      {
        label: otherCategory.prettyName,
        value: 0,
        color: otherCategory.color,
        tip: (value: number, labels?: string[]) =>
          this.category2tip(
            value,
            totalMinutes,
            Array.from(
              labels?.map(
                (label) => categories.find((cat) => cat.prettyName == label)!
              ) ?? []
            )
          ),
      }
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

  makeLineChart(
    categories: Record<string, CalculatedCategoryDated[]>,
    totalDateMinutes: Record<string, number>
  ): HTMLElement {
    const units: LineChartDataUnit[] = Object.entries(categories).map(
      ([_, catHistory]) => ({
        label: catHistory.first()!.prettyName,
        values: catHistory.map((cat) => [cat.date, cat.totalMinutes]),
        color: catHistory.first()!.color,
        hidden: catHistory.first()!.hideOnLineChart,
      })
    );

    units.forEach((unit) =>
      unit.values.sort((a, b) => a[0].localeCompare(b[0]))
    );

    const canvas = this.charts.line(
      units,
      undefined,
      undefined,
      (category, _, dates) => {
        const cats = Object.entries(categories)
          .find(
            ([_, catHistory]) => catHistory.first()?.prettyName == category
          )![1]
          .filter((cat) => dates.includes(cat.date));

        return cats.length > 0
          ? this.category2tip(
              cats.reduce((acc, cat) => acc + cat.totalMinutes, 0),
              dates
                .map((date) => totalDateMinutes[date])
                .reduce((acc, minutes) => acc + minutes, 0),
              cats
            )
          : [];
      },
      60,
      formatMinutes,
      15
    );

    const chartContainer = document.createElement("div");
    chartContainer.className = "category-line-chart";
    chartContainer.style.maxHeight = "380px";
    chartContainer.style.width = "100%";
    chartContainer.style.height = "100%";
    chartContainer.appendChild(canvas);

    return chartContainer;
  }

  private category2tip(
    value: number,
    totalMinutes: number,
    category: CalculatedCategory[]
  ): string[] {
    const units = category.flatMap((cat) => cat.units);
    const map = new Map<string, number>(); // certain category -> minutes

    units.forEach((unit) => {
      map.set(
        unit.certainCategory,
        (map.get(unit.certainCategory) ?? 0) + unit.minutes
      );
    });

    const result = [
      formatMinutes(value) +
        "; " +
        ((value / totalMinutes) * 100).toFixed(1).replace(".", ",") +
        "%",
    ];

    const list = Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
    list.forEach(([certainCategory, minutes]) => {
      const filteredUnits = units
        .filter((unit) => unit.certainCategory == certainCategory)
        .sort((a, b) => b.minutes - a.minutes);

      if (filteredUnits.length == 0) {
        return;
      }

      if (filteredUnits.length == 1) {
        const unit = filteredUnits[0];
        const comment =
          unit.comment && unit.comment != "" ? ` (${unit.comment})` : "";
        result.push(
          unit.certainCategory + comment + " " + formatMinutes(unit.minutes)
        );
        return;
      }

      result.push(certainCategory + " " + formatMinutes(minutes));
      filteredUnits.forEach((unit) => {
        const comment =
          unit.comment && unit.comment != "" ? ` ${unit.comment}` : " *empty*";
        result.push(" └ " + comment + " " + formatMinutes(unit.minutes));
      });
    });

    return result;
  }

  /**
   * Форматирует значение в виде строки с процентным соотношением.
   * @param value значение для форматирования (одной категории в целом).
   * @param totalMinutes общее значение для вычисления процента.
   * @returns Строка с отформатированным значением и процентом.
   */
  private category2tipLegacy(
    value: number,
    totalMinutes: number,
    category: CalculatedCategory[]
  ): string[] {
    return [
      formatMinutes(value) +
        "; " +
        ((value / totalMinutes) * 100).toFixed(1).replace(".", ",") +
        "%",
      ...category
        .flatMap((u) => u.units)
        .sort((a, b) => b.minutes - a.minutes)
        .map(
          (c) =>
            c.certainCategory +
            (c.comment && c.comment != "" ? ` (${c.comment})` : "") +
            " " +
            formatMinutes(c.minutes)
        ),
    ];
  }
}
