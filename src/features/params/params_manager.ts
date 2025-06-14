import ParamsYaml, {
  Param,
  ParamHistory,
  ParamValue,
} from "src/features/params/models/param";
import ParamsConfigHolder from "./states/params_config_holder";

export default class ParamsManager {
  constructor(private paramsConfigHolder: ParamsConfigHolder) {}

  getParametersArray(pages: Record<string, any>[]): ParamHistory[] {
    const paramsList: ParamHistory[] = [];

    for (const paramYaml of this._getParams().params) {
      const rawValues: ParamValue[] = [];
      for (const page of pages) {
        const val = page[paramYaml.name];
        if (typeof val === "number") {
          rawValues.push({ date: page.file.name, value: val });
        }
      }
      paramsList.push({
        name: paramYaml.name,
        order: paramYaml.order,
        values: rawValues,
        color: paramYaml.color,
        hiddenOnChart: paramYaml.hiddenOnChart,
      });
    }

    // Сортируем по order
    return paramsList
      .filter((param) => param.values.length > 0)
      .sort((a, b) => a.order - b.order);
  }

  calculateAverages(pages: ParamHistory[]): Param[] {
    return this.calculateAveragesByParams(pages);
  }

  calculateAveragesByParams(params: ParamHistory[]): Param[] {
    return params.map((param) => ({
      name: param.name,
      order: param.order,
      value:
        param.values.reduce((acc, curr) => acc + curr.value, 0) /
        param.values.length,
      color: param.color,
      hiddenOnChart: param.hiddenOnChart,
    }));
  }

  private _getParams(): ParamsYaml {
    const params = this.paramsConfigHolder.state;
    if (!params) {
      throw new Error("Params not found");
    }
    return params;
  }
}
