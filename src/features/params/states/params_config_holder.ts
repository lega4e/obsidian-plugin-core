import ParamsYaml from "../models/param";
import DvApi from "src/domain/interfaces/dv_api";
import ValueNotifier from "src/utils/notifiers/value_notifier";
import LazyDerivedValueNotifier from "src/utils/notifiers/lazy_derived_notifier";
import { App } from "obsidian";
import YamlHeader from "src/library/obsidian/YamlHeader";

export default class ParamsConfigHolder extends LazyDerivedValueNotifier<ParamsYaml | null> {
  constructor(
    private dv: () => DvApi,
    private app: () => App,
    paramsPathHolder: ValueNotifier<string>
  ) {
    super([paramsPathHolder], ([path], _) => {
      if (path.state === "") {
        return null;
      }

      new YamlHeader(() => app()).get<ParamsYaml>(path.state).then((yaml) => {
        this.state = yaml;
      });

      const file = dv().page(path.state);
      if (!file) {
        console.error(`Can't find file '${path}'`);
        return null;
      }

      return file as unknown as ParamsYaml;
    });
  }
}
