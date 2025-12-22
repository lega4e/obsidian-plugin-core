import TabsPrinterConfig from "../models/tabs_config";
import ValueNotifier from "src/utils/notifiers/value_notifier";
import DvApi from "src/domain/interfaces/dv_api";
import LazyDerivedValueNotifier from "src/utils/notifiers/lazy_derived_notifier";
import YamlHeader from "src/library/obsidian/YamlHeader";
import { App } from "obsidian";

export default class TabsConfigHolder extends LazyDerivedValueNotifier<TabsPrinterConfig | null> {
  constructor(
    dv: () => DvApi,
    app: () => App,
    pathHolder: ValueNotifier<string>
  ) {
    super([pathHolder], () => {
      if (pathHolder.state === "") {
        return null;
      }

      new YamlHeader(() => app())
        .get<TabsPrinterConfig>(pathHolder.state)
        .then((yaml) => {
          this.state = yaml;
        });

      const file = dv().page(pathHolder.state);
      if (!file) {
        return null;
      }

      return file as unknown as TabsPrinterConfig;
    });
  }
}
