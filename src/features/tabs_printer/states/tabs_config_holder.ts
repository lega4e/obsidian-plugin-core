import TabsPrinterConfig from "../models/tabs_config";
import ValueNotifier from "src/utils/notifiers/value_notifier";
import DvApi from "src/domain/interfaces/dv_api";
import LazyDerivedValueNotifier from "src/utils/notifiers/lazy_derived_notifier";

export default class TabsConfigHolder extends LazyDerivedValueNotifier<TabsPrinterConfig | null> {
  constructor(dv: () => DvApi, pathHolder: ValueNotifier<string>) {
    super([pathHolder], () => {
      if (pathHolder.state === "") {
        return null;
      }

      const file = dv().page(pathHolder.state);
      if (!file) {
        console.error(`Can't find file '${pathHolder.state}'`);
        return null;
      }

      return file as unknown as TabsPrinterConfig;
    });
  }
}
