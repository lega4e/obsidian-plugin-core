import Chart from "chart.js/auto";
import ChartDataLabels from "chartjs-plugin-datalabels";

export interface PieChartDataUnit {
  label: string;
  value: number;
  color?: string;
  tip:
    | string
    | string[]
    | ((value: any) => string)
    | ((value: any) => string[]);
}

export interface LineChartDataUnit {
  label: string;
  values: number[];
  color?: string;
}

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

    if (otherDataUnit) {
      [labels, values] = this._shrinkToOther(
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
            color: "#fff", // Цвет текста
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
                let tip = data.find(
                  (item) => item.label == tooltipItem.label,
                )?.tip;
                if (typeof tip == "function") {
                  return tip(tooltipItem.raw as number);
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
    xlabels: string[],
    units: LineChartDataUnit[],
    minY?: number,
    maxY?: number,
  ): HTMLCanvasElement {
    const canvas = document.createElement("canvas");

    new Chart(canvas, {
      type: "line",
      data: {
        labels: xlabels,
        datasets: units.map((unit) => ({
          label: unit.label,
          data: unit.values,
          borderColor: this._generateColor(unit.label, unit.color),
          fill: false,
          tension: 0.4,
        })),
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: true },
        },
        scales: {
          y: {
            beginAtZero: true,
            max: maxY,
            min: minY,
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
  ): [string[], number[]] {
    const total = values.reduce((a, b) => a + b, 0);

    let i = values.length;
    for (; i >= 0; --i) {
      if (values[i] / total > ratio) {
        break;
      }
    }
    i += 1;

    if (i < values.length) {
      values[i] = values.slice(i, values.length).reduce((a, b) => a + b);
      values = Array.from(values.slice(0, i + 1));

      labels[i] = otherDataUnit.label;
      labels = Array.from(labels.slice(0, i + 1));
    }

    return [labels, values];
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
}