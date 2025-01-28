import { Chart } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { DvApi } from "src/domain/interfaces/data_view";

export class ChartManager {
    private dv: DvApi;
    private colors: Record<string, string>;
    private catToColors: Map<string, string>;

    constructor(dv: DvApi) {
      this.dv = dv;
      this.colors = {
        red: "rgba(255, 99, 132, 0.7)", // Красный
        blue: "rgba(54, 162, 235, 0.7)", // Синий
        yellow: "rgba(255, 206, 86, 0.7)", // Желтый
        cyan: "rgba(75, 192, 192, 0.7)", // Бирюзовый
        purpur: "rgba(153, 102, 255, 0.7)", // Фиолетовый
        orange: "rgba(255, 159, 64, 0.7)", // Оранжевый
        gray: "rgba(201, 203, 207, 0.7)", // Серый
        green: "rgba(123, 239, 178, 0.7)", // Салатовый
        pink: "rgba(255, 140, 203, 0.7)", // Розовый
        graphit: "rgba(87, 117, 144, 0.7)", // Графитовый
        lightblue: "rgba(0, 128, 255, 0.7)", // Ярко-синий (электрик)
      };
      this.catToColors = new Map();
      this.catToColors.set("Базированный", this.colors.gray);
      this.catToColors.set("Успешный", this.colors.orange);
      this.catToColors.set("Телесный", this.colors.pink);
      this.catToColors.set("Духовный", this.colors.cyan);
      this.catToColors.set("Умелый", this.colors.lightblue);
      this.catToColors.set("Деятельный", this.colors.red);
      this.catToColors.set("Весёлый", this.colors.yellow);
      this.catToColors.set("Проёбушек", this.colors.purpur);
      this.catToColors.set("Лёгкий", this.colors.green);
      this.catToColors.set("Интересный", this.colors.blue);
      this.catToColors.set("Остальное", this.colors.graphit);
    }

    pie(
      data: [string, number][],
      callback: (element: HTMLElement) => void,
      tooltipLabel: (value: number) => string
    ): void {
      if (data.length == 0) {
        const p = document.createElement("p");
        p.textContent = "Учёт времени не заполнен..";
        callback(p);
        return;
      }

      const canvas = document.createElement("canvas");

      const [labels, values] = this._shrinkToOther(
        data.map((row) => row[0]),
        data.map((row) => row[1]),
        1 / 20,
      );

      const colors = labels.map((label) => this.catToColors.get(label));

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
              formatter: (value, context) => {
                return context.chart.data.labels?.[context.dataIndex] ?? '';
              },
              font: {
                weight: "bold",
                size: 10,
              },
            },
            tooltip: {
              callbacks: {
                label: (tooltipItem) => " " + tooltipLabel(tooltipItem.raw as number),
              },
            },
          },
        },
        plugins: [ChartDataLabels],
      });

      callback(canvas);
    }

    private _shrinkToOther(labels: string[], values: number[], ratio: number): [string[], number[]] {
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

        labels[i] = "Остальное";
        labels = Array.from(labels.slice(0, i + 1));
      }

      return [labels, values];
    }
  }
