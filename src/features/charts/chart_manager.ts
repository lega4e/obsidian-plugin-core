import Chart from "chart.js/auto";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { injectable } from "inversify";

export interface PieChartDataUnit {
  label: string;
  value: number;
  color?: string;
  tip:
    | string
    | string[]
    | ((value: any, labels?: string[]) => string | string[]);
}

export interface LineChartDataUnit {
  label: string;
  values: [string, number][];
  color?: string;
  hidden: boolean;
}

@injectable()
export class ChartManager {
  /**
   * Строит круговую диаграмму.
   * @param data Массив объектов с данными для каждого набора.
   * @param otherDataUnit Дополнительный объект, показывающий как рисовать "Остальное".
   * @returns HTMLCanvasElement с построенной диаграммой.
   */
  pie(
    data: PieChartDataUnit[],
    otherDataUnit?: PieChartDataUnit,
  ): HTMLCanvasElement {
    if (data.length == 0) {
      throw new Error("Data is empty");
    }

    const canvas = document.createElement("canvas");

    let [labels, values] = [
      data.map((row) => row.label),
      data.map((row) => row.value),
    ];
    let otherLabels: string[] = [];

    if (otherDataUnit) {
      [labels, values, otherLabels] = this._shrinkToOther(
        labels,
        values,
        otherDataUnit,
        1 / 20,
      );
      data.push(otherDataUnit);
    }

    const colors = labels
      .map((label) => data.find((item) => item.label == label))
      .map((item) => this._generateColor(item!.label, item!.color));

    new Chart(canvas, {
      type: "pie",
      data: {
        labels: labels,
        datasets: [
          {
            data: values,
            backgroundColor: colors,
            borderColor: "#999",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false,
          },
          datalabels: {
            color: "#fff",
            formatter: (_, context) => {
              return context.chart.data.labels?.[context.dataIndex] ?? "NONE";
            },
            font: {
              weight: "bold",
              size: 10,
            },
          },
          tooltip: {
            callbacks: {
              label: (tooltipItem) => {
                let item = data.find((item) => item.label == tooltipItem.label);
                let tip = item?.tip;

                if (typeof tip == "function") {
                  return tip(
                    tooltipItem.raw as number,
                    item?.label == otherDataUnit?.label
                      ? otherLabels
                      : undefined,
                  );
                }
                return tip;
              },
            },
          },
        },
      },
      plugins: [ChartDataLabels],
    });

    return canvas;
  }

  /**
   * Строит график с несколькими наборами данных.
   * @param units Массив объектов с данными для каждого набора.
   * @returns HTMLCanvasElement с построенным графиком.
   */
  public line(
    units: LineChartDataUnit[],
    minY?: number,
    maxY?: number,
    labelCallback?: (category: string, value: number, date: string) => string[],
    tickStepSize?: number,
    tickCallback?: (value: number) => string,
    maxPoints: number = 15,
  ): HTMLCanvasElement {
    const canvas = document.createElement("canvas");

    let aggregatedUnits = units;

    const allXValues = units.map((unit) => unit.values.map(([x, y]) => x));
    const firstXValues = allXValues[0];
    const allSameX = allXValues.every(
      (xValues) =>
        xValues.length === firstXValues.length &&
        xValues.every((x, i) => x === firstXValues[i]),
    );

    if (allSameX) {
      aggregatedUnits = units.map((unit) => ({
        ...unit,
        values: this._aggregateDataPoints(unit.values, maxPoints),
      }));
    }

    new Chart(canvas, {
      type: "line",
      data: {
        datasets: aggregatedUnits.map((unit) => ({
          label: unit.label,
          data: unit.values,
          borderColor: this._generateColor(unit.label, unit.color),
          fill: false,
          tension: 0.4,
          hidden: unit.hidden,
        })),
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: true },
          tooltip: {
            callbacks: {
              label: (context) =>
                labelCallback?.(
                  context.dataset.label || "",
                  context.parsed.y,
                  context.label,
                ) ?? context.formattedValue,
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            max: maxY,
            min: minY,
            ticks: {
              stepSize: tickStepSize,
              callback: tickCallback,
            },
          },
        },
      },
    });
    return canvas;
  }

  private _shrinkToOther(
    labels: string[],
    values: number[],
    otherDataUnit: PieChartDataUnit,
    ratio: number,
  ): [string[], number[], string[]] {
    let otherLabels: string[] = [];
    const total = values.reduce((a, b) => a + b, 0);

    let i = values.length - 1;
    for (; i >= 0; --i) {
      if (values[i] / total > ratio) {
        break;
      }
    }
    i += 1;

    if (i < values.length - 1) {
      values[i] = values.slice(i, values.length).reduce((a, b) => a + b);
      values = Array.from(values.slice(0, i + 1));

      otherLabels = Array.from(labels.slice(i, labels.length));
      labels[i] = otherDataUnit.label;
      labels = Array.from(labels.slice(0, i + 1));
    }

    return [labels, values, otherLabels];
  }

  // Новый приватный метод для генерации цвета
  private _generateColor(label: string, color?: string): string {
    if (color) {
      return color;
    }
    const hash = label.split("").reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    const c = (hash & 0x00ffffff).toString(16).toUpperCase();
    let generatedColor = "#" + "00000".substring(0, 6 - c.length) + c;

    // Приглушаем цвет, смешивая с серым
    const r = parseInt(generatedColor.slice(1, 3), 16);
    const g = parseInt(generatedColor.slice(3, 5), 16);
    const b = parseInt(generatedColor.slice(5, 7), 16);
    const mixRatio = 0.3;
    const grayValue = 128;
    const newR = Math.round(r * (1 - mixRatio) + grayValue * mixRatio);
    const newG = Math.round(g * (1 - mixRatio) + grayValue * mixRatio);
    const newB = Math.round(b * (1 - mixRatio) + grayValue * mixRatio);
    return `rgba(${newR}, ${newG}, ${newB}, 0.8)`;
  }

  // Добавляем новый приватный метод для агрегации точек
  private _aggregateDataPoints(
    points: [string, number][],
    maxPoints: number,
  ): [string, number][] {
    if (points.length <= maxPoints) {
      return points;
    }

    const chunkSize = Math.ceil(points.length / maxPoints);
    const aggregated: [string, number][] = [];

    for (let i = 0; i < points.length; i += chunkSize) {
      const chunk = points.slice(i, i + chunkSize);
      const avgValue =
        chunk.reduce((sum, [_, val]) => sum + val, 0) / chunk.length;
      // Берём среднюю точку из чанка как метку времени
      const middlePoint = chunk[Math.floor(chunk.length / 2)][0];
      aggregated.push([middlePoint, avgValue]);
    }

    return aggregated;
  }
}