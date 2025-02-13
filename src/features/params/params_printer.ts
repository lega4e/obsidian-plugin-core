import type { DvApi } from "src/domain/interfaces/dv_api";
import { ParamsManager } from "src/features/params/params_manager";
import { Param } from "src/features/params/models/param";
import { ChartManager } from "../charts/chart_manager";
import { inject, injectable } from "inversify";
import { TYPES } from "src/domain/di/types";

@injectable()
export class ParamsPrinter {
  private pages: Record<string, any>[];
  private paramsArray: Param[];
  private averagedParams?: Param[];
  private previousAveragedParams?: Param[];
  private nextAveragedParams?: Param[];

  constructor(
    @inject(TYPES.DvApi) private dv: () => DvApi,
    @inject(TYPES.ParamsManager) private paramsManager: ParamsManager,
    @inject(TYPES.ChartManager) private charts: ChartManager,
  ) {}

  // loadParams – вычисляет средние значения параметров на основе списка страниц.
  loadParams(
    pages: Record<string, any>[],
    previousPages?: Record<string, any>[],
    nextPages?: Record<string, any>[],
  ): void {
    this.pages = pages;
    this.paramsArray = this.paramsManager.getParametersArray(pages);
    this.averagedParams = this.paramsManager.calculateAverages(pages);
    this.previousAveragedParams = undefined;
    this.nextAveragedParams = undefined;
    if (previousPages) {
      this.previousAveragedParams =
        this.paramsManager.calculateAverages(previousPages);
    }
    if (nextPages) {
      this.nextAveragedParams = this.paramsManager.calculateAverages(nextPages);
    }
  }

  // clearParams – очищает сохранённые параметры.
  clearParams(): void {
    this.averagedParams = undefined;
    this.previousAveragedParams = undefined;
    this.nextAveragedParams = undefined;
  }

  // buildTable – создаёт таблицу с заголовком ['Название', 'Среднее значение']
  // и выводит name параметра в первом столбце, а среднее значение (value[0]) – во втором.
  buildTable(): void {
    if (!this.averagedParams) {
      throw new Error("Параметры не загружены. Сначала вызовите loadParams()!");
    }

    const headers = [
      "Название",
      "Среднее значение",
      ...(this.previousAveragedParams ? ["Предыдущее"] : []),
      ...(this.nextAveragedParams ? ["Следующее"] : []),
    ];
    const rows = this.averagedParams.map((param) => [
      param.name,
      this._prettyValue(param.values),
      ...(this.previousAveragedParams
        ? [
            this._prettyValue(
              this.previousAveragedParams?.find((p) => p.name == param.name)
                ?.values,
            ),
          ]
        : []),
      ...(this.nextAveragedParams
        ? [
            this._prettyValue(
              this.nextAveragedParams?.find((p) => p.name == param.name)
                ?.values,
            ),
          ]
        : []),
    ]);

    this.dv().table(headers, rows);
  }

  getChart(): HTMLElement {
    if (this.paramsArray.length == 0 || this.pages.length == 0) {
      throw new Error("Параметры не загружены. Сначала вызовите loadParams()!");
    }

    return this.charts.line(
      this.paramsArray.map((param) => ({
        label: param.name,
        values: param.values,
        color: param.color,
        hidden: param.hiddenOnChart || false,
      })),
      0,
      11,
      undefined,
      1,
    );
  }

  private _prettyValue(value?: [string, number][]): string {
    return !value
      ? ""
      : value.length > 0
        ? value[0][1].toFixed(1).replace(/\./g, ",")
        : "undefined";
  }
}