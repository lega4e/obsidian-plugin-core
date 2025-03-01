import { inject, injectable } from "inversify";
import { container } from "src/domain/di/di";
import { TYPES } from "src/domain/di/types";
import { DvApi } from "src/domain/interfaces/dv_api";
import { ValueNotifier, DerivedValueNotifier } from "src/utils/value_notifier";

@injectable()
export class CategoriesConfigHolder extends DerivedValueNotifier<
  CategoriesYaml | undefined
> {
  constructor(
    @inject(TYPES.DvApi) private _dv: () => DvApi,
    @inject(TYPES.CategoriesPathHolder)
    categoriesPathHolder: ValueNotifier<string>,
  ) {
    super([categoriesPathHolder], ([path], _) => {
      console.log("CategoriesConfigHolder() path", path);
      if (path.value === "") {
        return undefined;
      }

      return CategoriesConfigHolder.calc(_dv(), path.value);
    });
  }

  static calc(dv: DvApi, path: string): CategoriesYaml | undefined {
    const file = dv.page(path);
    if (!file) {
      console.error(`Can't find file '${path}'`);
      return undefined;
    }
    return file as unknown as CategoriesYaml;
  }
}