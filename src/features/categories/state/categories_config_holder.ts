import DvApi from "src/domain/interfaces/dv_api";
import ValueNotifier from "src/utils/notifiers/value_notifier";
import CategoriesYaml from "../models/categories_yaml";
import LazyDerivedValueNotifier from "src/utils/notifiers/lazy_derived_notifier";

export default class CategoriesConfigHolder extends LazyDerivedValueNotifier<CategoriesYaml | null> {
  constructor(dv: () => DvApi, categoriesPathHolder: ValueNotifier<string>) {
    super([categoriesPathHolder], ([path], _) => {
      if (path.state === "") {
        return null;
      }

      const file = dv().page(path.state);
      if (!file) {
        console.error(`Can't find file '${path.state}'`);
        return null;
      }

      return file as unknown as CategoriesYaml;
    });
  }
}
