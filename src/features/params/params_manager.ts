import type { DvApi } from "src/domain/interfaces/dv_api";
import { Param, ParamsYaml } from "src/features/params/models/param";
import { inject, injectable } from "inversify";
import { TYPES } from "src/domain/di/types";
import { ParamsConfigHolder } from "./models/params_config_holder";

@injectable()
export class ParamsManager {
  constructor(
    @inject(TYPES.DvApi) private dv: () => DvApi,
    @inject(TYPES.ParamsConfigHolder)
    private paramsConfigHolder: ParamsConfigHolder,
  ) {}

  // Публичная функция для получения массива объектов Param,
  // где value содержит массив чисел из значений каждой страницы.
  getParametersArray(pages: Record<string, any>[]): Param[] {
    const paramsList: Param[] = [];

    for (const paramYaml of this._getParams().params) {
      const rawValues: [string, number][] = [];
      // Собираем числа для данного параметра из страниц по ключу paramYaml.name
      for (const page of pages) {
        const val = page[paramYaml.name];
        if (typeof val === "number") {
          rawValues.push([page.file.name, val]);
        }
      }
      paramsList.push(
        new Param(
          paramYaml.name,
          paramYaml.order,
          rawValues,
          paramYaml.color,
          paramYaml.hiddenOnChart,
        ),
      );
    }

    // Сортируем по order
    return paramsList
      .filter((param) => param.values.length > 0)
      .sort((a, b) => a.order - b.order);
  }

  // Публичная функция для вычисления среднего значения для каждого параметра.
  // Возвращает список объектов Param, где value – это число (среднее).
  calculateAverages(pages: Record<string, any>[]): Param[] {
    const rawParams = this.getParametersArray(pages);
    const averagedParams: Param[] = [];

    for (const param of rawParams) {
      const values = param.values;
      const sum = values.reduce((acc, curr) => acc + curr[1], 0);
      const avg = sum / values.length;
      averagedParams.push(new Param(param.name, param.order, [["", avg]]));
    }

    // Уже отсортировано в getParametersArray, но можно ещё раз отсортировать для гарантии
    return averagedParams.sort((a, b) => a.order - b.order);
  }

  private _getParams(): ParamsYaml {
    const params = this.paramsConfigHolder.value;
    if (!params) {
      throw new Error("Params not found");
    }
    return params;
  }
}