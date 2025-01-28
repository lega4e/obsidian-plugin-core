import { Category } from "src/features/categories/category";
import { CategoryInformation } from "src/features/categories/category_information";
import { ChartManager } from "src/features/charts/charts";
import { DvApi } from "src/domain/interfaces/data_view";


export class CategoryCalculator {
    private dv: DvApi;
    private common: Map<string, Category>;
    private sub: Map<string, Category>;
    private certain: Map<string, Category>;
    private skipBase: boolean;
    private charts: ChartManager; // Предполагается, что есть тип ChartManager

    constructor(dv: any) {
      this.dv = dv;

      this.common = new Map();
      this.sub = new Map();
      this.certain = new Map();
      this.skipBase = true;
      this._parseCategories();
      this.charts = new ChartManager(this.dv);
    }

    calculate(pages: any[]): CategoryInformation {
      if (Array.from(pages).length == 0) {
        return new CategoryInformation([], [], 0, 0, 0);
      }

      return Array.from(pages).map((a) => this._parseAndSumDailyTimes(a));
    }

    checkCanBuild(page: Record<string, any>): boolean {
      const entries = page["Времяучёт"];
      return entries != null && Array.isArray(entries) && entries.length != 0;
    }

    buildTable(info: CategoryInformation): void {
      const rows = [];
      for (let i = 0; i < info.sub.length; ++i) {
        rows[i] = [
          info.sub[i][0],
          this._prettyMinutes(info.sub[i][1]),
          (info.com[i] || [""])[0],
          this._prettyMinutes((info.com[i] || ["", ""])[1]),
        ];
      }
      this.dv.table(["Категории", "Время", "Общие", "Время"], rows);
      this.dv.span(
        (info.total == 0
          ? ""
          : "\nИтого: " + this._prettyMinutes(info.total)) +
          (!info.totalDailyTime
            ? ""
            : "\nДолжно: " +
              this._prettyMinutes(info.totalDailyTime) +
              (info.total < info.totalDailyTime
                ? "\nНехватка: "
                : "\nИзбыток: ") +
              this._prettyMinutes(
                Math.abs(info.totalDailyTime - info.total),
              )),
      );
    }

    buildChart(info: CategoryInformation): void {
      if (info.com.length == 0) {
        this.dv.paragraph("\nНет данных для построения диаграммы...");
        return;
      }

      this.charts.pie(
        info.com.filter((a) => a[0] != "Базированный" || !this.skipBase),
        (canvas) =>
          this.dv.el("div", canvas, {
            cls: "my-custom-class", // Добавляем класс для стилей
            attr: {
              style: "max-width: 500px; width: 100%;", // Инлайн-стили
            },
          }),
        (value) =>
          this._prettyMinutes(value) +
          "; " +
          Math.floor(
            (value / (this.skipBase ? info.totalWithoutBase : info.total)) *
              100,
          ) +
          "%",
      );
    }

    private _calcDailyTotalTime(page: Record<string, any>): number | null {
      function timeToMinutes(time: string | null): number | null {
        if (time == null || time.trim() == "") {
          return null;
        }

        let [hours, minutes] = time.split(":");
        [hours, minutes] = [parseInt(hours), parseInt(minutes)];
        return hours * 60 + minutes;
      }

      let start = timeToMinutes(page["Подъём"]);
      let end = timeToMinutes(page["Отбой"]);

      if (start == null || end == null) {
        return null;
      }

      if (end < start) {
        end += 24 * 60;
      }

      return end - start;
    }

    private _prettyMinutes(total: number): string {
      if (typeof total != "number") {
        return "";
      }

      const minutes = total % 60;
      const hours = Math.floor(total / 60);

      return (
        `${hours != 0 ? hours.toString() + "ч." : ""} ` +
        `${minutes != 0 ? minutes.toString() + "м." : ""}`
      ).trim();
    }

    private _parseCategories(filePath?: string): void {
      const data = this.dv.page("Scripts/categories_v1.md");
      this.skipBase = data.settings.skipBase;

      // Обрабатываем common
      if (data.common) {
        for (const name of data.common) {
          this.common.set(name, new Category(name));
        }
      }

      // Обрабатываем sub
      if (data.sub) {
        for (const entry of data.sub) {
          const [key, value] = entry.split(":").map((str) => str.trim());
          const category = new Category(key, value, this.common);
          if (!category.parentCategory()) {
            throw new Error(
              `Родительская категория "${value}" из sub не найдена в common.`,
            );
          }
          this.sub.set(key, category);
        }
      }

      // Обрабатываем certain
      if (data.certain) {
        for (const entry of data.certain) {
          const [key, value] = entry.split(":").map((str) => str.trim());
          const category = new Category(key, value, this.sub);
          if (!category.parentCategory()) {
            throw new Error(
              `Родительская категория "${value}" из certain не найдена в sub.`,
            );
          }
          this.certain.set(key, category);
        }
      }
    }

    private _parseAndSumDailyTimes(page: Record<string, any>): CategoryInformation {
      if (!this.checkCanBuild(page)) {
        return new CategoryInformation([], [], 0, 0, 0);
      }

      const entries = page["Времяучёт"];
      let sub = new Map();
      let com = new Map();

      for (const entry of entries) {
        // Регулярное выражение для парсинга строки
        const match = entry.match(
          /^([^\d()]*)\s*(?:\((.*?)\))?\s*(?:(\d+)ч\.)?\s*(?:(\d+)м\.)?$/,
        );

        if (match) {
          const category = match[1].trim();
          const minutes =
            parseInt(match[3] || "0") * 60 + parseInt(match[4] || "0");

          const certainCategory = this.certain.get(category);
          if (!certainCategory) {
            throw new Error(`Не найдено конкретной категории ${category}`);
          }

          const subCatName = certainCategory.parentCategory().name;
          const comCatName = certainCategory
            .parentCategory()
            .parentCategory().name;

          sub.set(subCatName, (sub.get(subCatName) || 0) + minutes);

          com.set(comCatName, (com.get(comCatName) || 0) + minutes);
        } else {
          throw new Error(`error with match ${entry} | ${match}`);
        }
      }

      sub = Array.from(sub).sort((a, b) => b[1] - a[1]);
      com = Array.from(com).sort((a, b) => b[1] - a[1]);
      const total = com.map((a) => a[1]).reduce((a, b) => a + b);
      const totalWithoutBase = com
        .filter((a) => a[0] != "Базированный")
        .map((a) => a[1])
        .reduce((a, b) => a + b, 0);
      const totalDailyTime = this._calcDailyTotalTime(page);

      return new CategoryInformation(
        sub,
        com,
        total,
        totalWithoutBase,
        totalDailyTime,
      );
    }
  }