import { ParamsYaml } from "./param";
import { inject } from "inversify";
import { TYPES } from "src/domain/di/types";
import { DvApi } from "src/domain/interfaces/dv_api";
import { DerivedValueNotifier, ValueNotifier } from "src/utils/value_notifier";

export class ParamsConfigHolder extends DerivedValueNotifier<
  ParamsYaml | undefined
> {
  constructor(
    @inject(TYPES.DvApi) private dv: () => DvApi,
    @inject(TYPES.ParamsPathHolder)
    paramsPathHolder: ValueNotifier<string>,
  ) {
    super([paramsPathHolder], ([path], _) =>
      ParamsConfigHolder.calc(dv(), path.value),
    );
  }

  static calc(dv: DvApi, path: string): ParamsYaml | undefined {
    if (path === "") {
      return undefined;
    }

    const file = dv.page(path);
    if (!file) {
      console.error(`Can't find file '${path}'`);
      return undefined;
    }

    return file as unknown as ParamsYaml;
  }
}