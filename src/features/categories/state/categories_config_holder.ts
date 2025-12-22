import DvApi from "src/domain/interfaces/dv_api";
import ValueNotifier from "src/utils/notifiers/value_notifier";
import CategoriesYaml from "../models/categories_yaml";
import LazyDerivedValueNotifier from "src/utils/notifiers/lazy_derived_notifier";
import { App, normalizePath, TFile } from "obsidian";
import YamlHeader from "src/library/obsidian/YamlHeader";

export default class CategoriesConfigHolder extends LazyDerivedValueNotifier<CategoriesYaml | null> {
  constructor(
    dv: () => DvApi,
    app: () => App,
    categoriesPathHolder: ValueNotifier<string>
  ) {
    super([categoriesPathHolder], ([path], _) => {
      if (path.state === "") {
        return null;
      }

      new YamlHeader(() => app())
        .get<CategoriesYaml>(path.state)
        .then((yaml) => {
          this.state = yaml;
        });

      const file = dv().page(path.state);
      if (!file) {
        return null;
      }

      return file as unknown as CategoriesYaml;
    });
  }
}
