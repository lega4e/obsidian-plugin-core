import {
  Plugin,
  PluginSettingTab,
  Setting,
  App,
  normalizePath,
  TFile,
} from "obsidian";
import DvApi from "src/domain/interfaces/dv_api";
import Di from "src/domain/di/di";
import YamlHeader from "src/library/obsidian/YamlHeader";
import CategoriesYaml from "src/features/categories/models/categories_yaml";

interface Lega4eCorePluginSettings {
  categories_path: string;
  params_path: string;
  tabs_path: string;
}

const DEFAULT_SETTINGS: Lega4eCorePluginSettings = {
  categories_path: "Categories.md",
  params_path: "Params.md",
  tabs_path: "Tabs.md",
};

export default class Lega4eCorePlugin extends Plugin {
  settings: Lega4eCorePluginSettings;
  di: Di;

  async onload() {
    this.di = new Di();
    this.di.app = this.app;
    this.di.fileObserver.init();
    await this.loadSettings();
    this.addSettingTab(new Lega4eCorePluginSettingTab(this.app, this));
    this.registerApi();
    console.log("Lega4eCorePlugin loaded.");
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    this.di.categoriesConfigFileNameHolder.state =
      this.settings.categories_path;
    this.di.paramsConfigFileNameHolder.state = this.settings.params_path;
    this.di.tabsConfigFileNameHolder.state = this.settings.tabs_path;
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  registerApi() {
    (this.app as any).plugins.plugins["lega4e-core-plugin"].api = {
      init: (dv: DvApi) => {
        this.di.dv = dv;
        this.di.calculatedCategoriesParamsSource.state = undefined;
      },
      api: () => this.di.api,
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
            this.plugin.di.categoriesConfigFileNameHolder.state = value;
          })
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
            this.plugin.di.paramsConfigFileNameHolder.state = value;
          })
      );

    new Setting(containerEl)
      .setName("Tabs Path")
      .setDesc("Path to tabs md-YAML file")
      .addText((text) =>
        text
          .setPlaceholder("Enter tabs path")
          .setValue(this.plugin.settings.tabs_path)
          .onChange(async (value) => {
            this.plugin.settings.tabs_path = value;
            await this.plugin.saveSettings();
            this.plugin.di.tabsConfigFileNameHolder.state = value;
          })
      );
  }
}
