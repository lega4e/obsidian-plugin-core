import DvApi from "src/domain/interfaces/dv_api";
import CalculatedParamsHolder from "src/features/params/states/calculated_params_holder";
import ChartManager from "../charts/chart_manager";

export default class ParamsPrinter {
  constructor(
    private dv: () => DvApi,
    private charts: ChartManager,
    private params: CalculatedParamsHolder,
    private previousParams: CalculatedParamsHolder,
    private nextParams: CalculatedParamsHolder
  ) {}

  buildAveragesTable(): void {
    if (!this.params.state) {
      this.dv().el("div", "Параметров нет!");
      return;
    }

    const headers = [
      "Название",
      ...(this.previousParams.state ? ["Предыдущее"] : []),
      "Среднее значение",
      ...(this.nextParams.state ? ["Следующее"] : []),
    ];
    const rows = this.params.state.averages.map((param) => [
      param.name,
      ...(this.previousParams.state
        ? [
            this._prettyValue(
              this.previousParams.state?.averages.find(
                (p) => p.name == param.name
              )?.value
            ),
          ]
        : []),
      this._prettyValue(param.value),
      ...(this.nextParams.state
        ? [
            this._prettyValue(
              this.nextParams.state?.averages.find((p) => p.name == param.name)
                ?.value
            ),
          ]
        : []),
    ]);

    this.dv().table(headers, rows);
  }

  makeChart(): HTMLElement {
    if (!this.params.state) {
      const container = document.createElement("div");
      container.textContent = "Параметров нет!";
      return container;
    }

    return this.charts.line(
      this.params.state.history.map((param) => ({
        label: param.name,
        values: param.values.map((value) => [value.date, value.value]),
        color: param.color,
        hidden: param.hiddenOnChart || false,
      })),
      0,
      11,
      undefined,
      1
    );
  }

  private _prettyValue(value?: number): string {
    return !value ? "" : value.toFixed(1).replace(/\./g, ",");
  }
}
