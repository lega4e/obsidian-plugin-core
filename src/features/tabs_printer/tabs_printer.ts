import DvApi from "src/domain/interfaces/dv_api";
import TabsConfigHolder from "./states/tabs_config_holder";
import {
  Tab,
  TabCategories,
  TabPack,
  TabParams,
  TabSource,
  TabCategoriesType,
  TabParamsType,
  TabCategoriesHistory,
  TabCategoriesPie,
  TabCategoriesTable,
} from "./models/tabs_config";
import TabsLayoutWidget, { TabData } from "src/ui/tabs/tab_layout_widget";
import ParamsPrinter from "../params/params_printer";
import CategoryPrinter from "../categories/printers/category_printer";
import TableManager from "../tables/table_manager";

export default class TabsPrinter {
  constructor(
    private dv: () => DvApi,
    private configHolder: TabsConfigHolder,
    private paramsPrinter: ParamsPrinter,
    private categoriesPrinter: CategoryPrinter
  ) {}

  buildTabs(packId: string): void {
    const widget = new TabsLayoutWidget(
      undefined,
      this.getPack(packId).tabs.map((tab) => this.tab2tabData(tab))
    );
    this.dv().el("div", widget.container);
  }

  private getPack(packId: string): TabPack {
    const config = this.configHolder.state;
    if (!config) {
      throw new Error("No config found");
    }

    const pack = config.packs.find((p) => p.id === packId);
    if (!pack) {
      throw new Error(`No pack found with id ${packId}`);
    }

    return pack;
  }

  private tab2tabData(tab: Tab): TabData {
    switch (tab.source) {
      case TabSource.params:
        return this.tabParams2tabData(tab as TabParams);
      case TabSource.categories:
        return this.tabCategories2tabData(tab as TabCategories);
    }
  }

  private tabParams2tabData(tab: TabParams): TabData {
    if (tab.type === TabParamsType.history) {
      return {
        title: tab.title,
        content: () => this.paramsPrinter.makeChart(),
      };
    }

    throw new Error(`Unknown tab type: ${tab.type}`);
  }

  private tabCategories2tabData(tab: TabCategories): TabData {
    if (tab.type === TabCategoriesType.history) {
      const tabHistory = tab as TabCategoriesHistory;
      return {
        title: tabHistory.title,
        content: () =>
          this.categoriesPrinter.makeLineChart(tabHistory.packType),
      };
    }

    if (tab.type === TabCategoriesType.pie) {
      const tabPie = tab as TabCategoriesPie;
      return {
        title: tabPie.title,
        content: () => this.categoriesPrinter.makePieChart(tabPie.packType),
      };
    }

    if (tab.type === TabCategoriesType.table) {
      const tabTable = tab as TabCategoriesTable;
      const { titles, rows, onEmptyHTML } = this.categoriesPrinter.makeTable(
        tabTable.packTypes,
        tabTable.avg
      );
      return {
        title: tabTable.title,
        content: () => TableManager.makeTable(titles, rows, onEmptyHTML),
      };
    }

    throw new Error(`Unknown tab type: ${tab.type}`);
  }
}
