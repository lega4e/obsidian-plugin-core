import { Plugin, PluginSettingTab, Setting, App } from "obsidian";
import { DvApi } from "src/domain/interfaces/dv_api";
import { CategoryPrinter } from "src/features/categories/managers/category_printer";
import { DiaryPagesManager } from "src/features/diary/diary_pages_manager";
import { ParamsPrinter } from "src/features/params/params_printer";
import { TabCreator } from "src/ui/tabs/tab_creator";

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

  async onload() {
    await this.loadSettings();

    this.addSettingTab(new Lega4eCorePluginSettingTab(this.app, this));
    this.registerApi();
    console.log("Lega4eCorePlugin loaded.");
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  registerApi() {
    console.log("Lega4eCorePlugin registerApi");
    (this.app as any).plugins.plugins["lega4e-core-plugin"].api = {
      sayHello: (name: string) => `Hello, ${name}!`,
      diaryPagesManager: (dv: DvApi) => new DiaryPagesManager(dv),
      categoryPrinter: (dv: DvApi) =>
        new CategoryPrinter(dv, this.settings.categories_path),
      paramsPrinter: (dv: DvApi) =>
        new ParamsPrinter(dv, this.settings.params_path),
      tabCreator: (dv: DvApi) => new TabCreator(dv),
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
          }),
      );
  }
}