import Chart from "chart.js/auto";
import ChartDataLabels from "chartjs-plugin-datalabels";

export interface PieChartDataUnit {
  label: string;
  value: number;
  color: string;
  tip: string | ((value: number) => string);
}

export class ChartManager {
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

    const colors = labels.map((label) =>
      data.find((item) => item.label == label),
    );

    new Chart(canvas, {
      type: "pie",
      data: {
        labels: labels,
        datasets: [
          {
            data: values,
            backgroundColor: colors.map((item) => {
              if (!item?.color) {
                const hash = item!.label.split("").reduce((acc, char) => {
                  return char.charCodeAt(0) + ((acc << 5) - acc);
                }, 0);
                const c = (hash & 0x00ffffff).toString(16).toUpperCase();
                let color = "#" + "00000".substring(0, 6 - c.length) + c;

                // Приглушаем цвет, смешивая с серым
                const r = parseInt(color.slice(1, 3), 16);
                const g = parseInt(color.slice(3, 5), 16);
                const b = parseInt(color.slice(5, 7), 16);

                const mixRatio = 0.3; // Степень приглушения
                const grayValue = 128; // Средний серый

                const newR = Math.round(
                  r * (1 - mixRatio) + grayValue * mixRatio,
                );
                const newG = Math.round(
                  g * (1 - mixRatio) + grayValue * mixRatio,
                );
                const newB = Math.round(
                  b * (1 - mixRatio) + grayValue * mixRatio,
                );

                return `rgba(${newR}, ${newG}, ${newB}, 0.8)`;
              }
              return item.color;
            }),
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
}