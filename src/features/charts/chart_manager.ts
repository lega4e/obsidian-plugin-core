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
		otherDataUnit: PieChartDataUnit,
		callback: (element: HTMLElement) => void,
	): void {
		if (data.length == 0) {
			throw new Error("Data is empty");
		}

		const canvas = document.createElement("canvas");

		const [labels, values] = this._shrinkToOther(
			data.map((row) => row.label),
			data.map((row) => row.value),
			otherDataUnit,
			1 / 20,
		);
		data.push(otherDataUnit);

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
						backgroundColor: colors.map((item) => item!.color),
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

		callback(canvas);
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
