import { DvApi } from "src/domain/interfaces/dv_api";
import { ParamsManager } from "src/features/params/params_manager";
import { Param } from "src/features/params/models/param";
import { ChartManager } from "../charts/chart_manager";

export class ParamsPrinter {
  private dv: DvApi;
  private paramsManager: ParamsManager;
  private charts: ChartManager;
  private pages: Record<string, any>[];
  private paramsArray: Param[];
  private averagedParams?: Param[];
  private previousAveragedParams?: Param[];
  private nextAveragedParams?: Param[];

  // Если paramsManager не передан, то создаётся новый, используя имя файла с параметрами.
  constructor(
    dv: DvApi,
    paramsFile?: string,
    paramsManager?: ParamsManager,
    charts?: ChartManager,
  ) {
    this.dv = dv;
    this.charts = charts || new ChartManager();
    if (paramsManager) {
      this.paramsManager = paramsManager;
    } else {
      if (!paramsFile) {
        throw new Error(
          "Параметр paramsFile должен быть указан, если ParamsManager не передан",
        );
      }
      this.paramsManager = new ParamsManager(dv, paramsFile);
    }
  }

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
      this._prettyValue(param.value),
      ...(this.previousAveragedParams
        ? [
            this._prettyValue(
              this.previousAveragedParams?.find((p) => p.name == param.name)
                ?.value,
            ),
          ]
        : []),
      ...(this.nextAveragedParams
        ? [
            this._prettyValue(
              this.nextAveragedParams?.find((p) => p.name == param.name)?.value,
            ),
          ]
        : []),
    ]);

    this.dv.table(headers, rows);
  }

  getChart(): HTMLElement {
    if (this.paramsArray.length == 0 || this.pages.length == 0) {
      throw new Error("Параметры не загружены. Сначала вызовите loadParams()!");
    }

    return this.charts.line(
      this.pages.map((page) => page.file.name),
      this.paramsArray.map((param) => ({
        label: param.name,
        values: param.value,
        color: param.color,
      })),
      0,
      11,
    );
  }

  private _prettyValue(value?: number[]): string {
    return !value
      ? ""
      : value.length > 0
        ? value[0].toFixed(1).replace(/\./g, ",")
        : "undefined";
  }
}