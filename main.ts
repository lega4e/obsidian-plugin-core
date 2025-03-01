import { Plugin, PluginSettingTab, Setting, App } from "obsidian";
import { container } from "src/domain/di/di";
import { TYPES } from "src/domain/di/types";
import { DvApi } from "src/domain/interfaces/dv_api";

interface Lega4eCorePluginSettings {
  categories_path: string;
  params_path: string;
}

const DEFAULT_SETTINGS: Lega4eCorePluginSettings = {
  categories_path: "Categories.md",
  params_path: "Params.md",
};

export default class Lega4eCorePlugin extends Plugin {
  settings: Lega4eCorePluginSettings;
  dv?: DvApi;

  async onload() {
    await this.loadSettings();

    this.addSettingTab(new Lega4eCorePluginSettingTab(this.app, this));
    this.registerApi();
    console.log("Lega4eCorePlugin loaded.");
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    container.get<ValueNotifier<string>>(TYPES.CategoriesPathHolder).value =
      this.settings.categories_path;
    container.get<ValueNotifier<string>>(TYPES.ParamsPathHolder).value =
      this.settings.params_path;
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  registerApi() {
    console.log("Lega4eCorePlugin registerApi");

    if (container.isBound(TYPES.DvApi)) {
      container.unbind(TYPES.DvApi);
    }
    container.bind<() => DvApi>(TYPES.DvApi).toConstantValue(() => this.dv!);

    (this.app as any).plugins.plugins["lega4e-core-plugin"].api = {
      sayHello: (name: string) => `Hello, ${name}!`,
      init: (dv: DvApi) => {
        this.dv = dv;
        container
          .get<ValueNotifier<string>>(TYPES.CategoriesPathHolder)
          .notify();
        container.get<ValueNotifier<string>>(TYPES.ParamsPathHolder).notify();
      },
      diaryPagesManager: () => container.get(TYPES.DiaryPagesManager),
      categoryPrinter: () => container.get(TYPES.CategoryPrinter),
      paramsPrinter: () => container.get(TYPES.ParamsPrinter),
      diaryChartsManager: () => container.get(TYPES.DiaryChartsManager),
      tableManager: () => container.get(TYPES.TableManager),
    };
  }
}

class Lega4eCorePluginSettingTab extends PluginSettingTab {
  plugin: Lega4eCorePlugin;

  constructor(app: App, plugin: Lega4eCorePlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl)
      .setName("Categories Path")
      .setDesc("Path to categories md-YAML file")
      .addText((text) =>
        text
          .setPlaceholder("Enter categories path")
          .setValue(this.plugin.settings.categories_path)
          .onChange(async (value) => {
            this.plugin.settings.categories_path = value;
            await this.plugin.saveSettings();
            container.get<ValueNotifier<string>>(
              TYPES.CategoriesPathHolder,
            ).value = value;
          }),
      );

    new Setting(containerEl)
      .setName("Params Path")
      .setDesc("Path to params md-YAML file")
      .addText((text) =>
        text
          .setPlaceholder("Enter params path")
          .setValue(this.plugin.settings.params_path)
          .onChange(async (value) => {
            this.plugin.settings.params_path = value;
            await this.plugin.saveSettings();
            container.get<ValueNotifier<string>>(TYPES.ParamsPathHolder).value =
              value;
          }),
      );
  }
}