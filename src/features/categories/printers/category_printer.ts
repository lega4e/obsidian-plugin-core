import type DvApi from "src/domain/interfaces/dv_api";
import CategoryCharts from "../managers/category_charts";
import CategoriesHolder from "../state/categories_holder";
import CalculatedCategoriesHolder, {
  CalculatedCategoryDated,
} from "../state/calculated_categories_holder";
import { formatMinutes } from "../models/item";
import { CategoryPack } from "../models/category";
import CategoryPagesHolder from "../state/category_pages_holder";
import CategoriesOverridedByTabsHolder from "../state/categories_overrided_by_tabs_holder";

export default class CategoryPrinter {
  constructor(
    private dv: () => DvApi,
    private charts: CategoryCharts,
    private categoryPagesHolder: CategoryPagesHolder,
    private categoriesHolder: CategoriesHolder,
    private calculatedCategories: CalculatedCategoriesHolder
  ) {}

  // TABLES
  buildTable(packTypes: string[], avg: boolean = false): void {
    const { titles, rows } = this.makeTable(packTypes, avg);
    this.dv().table(titles, rows);
  }

  makeTable(
    packTypes: string[],
    avg: boolean = false,
    source: "classic" | "tabs_overrided" = "classic"
  ): {
    titles: string[];
    rows: string[][];
    onEmptyHTML: string;
  } {
    const packs = packTypes.map((packType) => {
      const pack = this.categoriesHolder.state!.packs.find(
        (p) => p.type === packType
      );
      if (!pack) {
        throw new Error(`Pack type ${packType} not found`);
      }
      return pack;
    });

    const titles = packs.map((pack) => [pack.prettyName, "Время"]).flat();
    const rowsPack = packs.map((pack) =>
      pack.categories
        .map((cat) => this.calculatedCategories.state!.averages[cat.name])
        .filter((cat) => !!cat)
        .sort((a, b) => b.totalMinutes - a.totalMinutes)
    );

    const daysCount = !avg ? undefined : this.categoryPagesHolder.state.length;

    const rows = [];
    for (let i = 0; i < Math.max(...rowsPack.map((cats) => cats.length)); ++i) {
      rows.push(
        rowsPack
          .map((cats) => {
            if (!cats[i]) {
              return ["", ""];
            }
            return [
              cats[i].prettyName,
              this.unit2tip(
                cats[i].totalMinutes,
                this.calculatedCategories.state!.totalMinutes,
                daysCount
              ),
            ];
          })
          .flat()
      );
    }

    return { titles, rows, onEmptyHTML: "Времяучёт не заполнен" };
  }

  // CHARTS
  makePieChart(packType: string): HTMLElement {
    const pack = this.findPack(packType);
    const categories = pack.categories
      .map((cat) => this.calculatedCategories.state!.averages[cat.name])
      .filter((cat) => !!cat)
      .sort((a, b) => b.totalMinutes - a.totalMinutes);

    return this.charts.makePieChart(
      categories,
      this.categoriesHolder.state!.otherCategory
    );
  }

  makeLineChart(packType: string): HTMLElement {
    const categories = Object.fromEntries(
      Object.entries(this.calculatedCategories.state!.history).filter(
        ([categoryName, _]) =>
          this.findPack(packType)
            .categories.map((cat) => cat.name)
            .includes(categoryName)
      )
    );

    for (const [catName, cats] of Object.entries(categories)) {
      cats.sort((a, b) => a.date.localeCompare(b.date));
      for (
        let pageIndex = 0, catIndex = 0;
        pageIndex < this.categoryPagesHolder.state.length;
        ++pageIndex, ++catIndex
      ) {
        const date = this.categoryPagesHolder.state[pageIndex].file.name;
        if (!cats[catIndex] || date !== cats[catIndex].date) {
          const newCat: CalculatedCategoryDated = {
            date,
            totalMinutes: 0,
            name: catName,
            prettyName: cats.first()!.prettyName,
            color: cats.first()!.color,
            hideOnLineChart: cats.first()!.hideOnLineChart,
            units: [],
          };
          cats.splice(catIndex, 0, newCat);
        }
      }
    }

    if (Object.keys(categories).length === 0) {
      const container = document.createElement("div");
      container.textContent = "График не заполнен!";
      return container;
    }

    return this.charts.makeLineChart(
      categories,
      this.calculatedCategories.state!.totalDateMinutes
    );
  }

  // UTILS
  private unit2tip(value: number, totalMinutes: number, days?: number): string {
    return (
      formatMinutes(days ? Math.round(value / days) : value) +
      (days ? " / д." : "") +
      "; " +
      ((value / totalMinutes) * 100).toFixed(1).replace(".", ",") +
      "%"
    );
  }

  private findPack(packType: string): CategoryPack {
    const pack = this.categoriesHolder.state!.packs.find(
      (p) => p.type === packType
    );

    if (!pack) {
      throw new Error(`Info for pack type ${packType} not found`);
    }

    return pack;
  }
}
