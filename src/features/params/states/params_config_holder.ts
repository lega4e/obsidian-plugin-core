import ParamsYaml from "../models/param";
import DvApi from "src/domain/interfaces/dv_api";
import ValueNotifier from "src/utils/notifiers/value_notifier";
import LazyDerivedValueNotifier from "src/utils/notifiers/lazy_derived_notifier";

export default class ParamsConfigHolder extends LazyDerivedValueNotifier<
  ParamsYaml | undefined
> {
  constructor(
    private dv: () => DvApi,
    paramsPathHolder: ValueNotifier<string>
  ) {
    super([paramsPathHolder], ([path], _) =>
      ParamsConfigHolder.calc(dv(), path.state)
    );
  }

  private static calc(dv: DvApi, path: string): ParamsYaml | undefined {
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
