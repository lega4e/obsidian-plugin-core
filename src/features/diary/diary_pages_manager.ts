import { Page } from '../../domain/interfaces/page';
import { DataView } from '../../domain/interfaces/data_view';

import * as moment from 'moment';

export class DiaryPagesManager {
    private dv: DataView;

    constructor(dv: DataView) {
      this.dv = dv;
    }

    /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
    /* ~~~~~                            EDGES                             ~~~~~ */
    /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
    weekEdges(page: Page): [string, string] {
      let weekStart: string | null = null;
      let weekEnd: string | null = null;

      if (page.file.name.match(/\d{4}-\d{2}-\d{2}/)) {
        weekStart = moment(page.file.name, "YYYY-MM-DD")
          .startOf("isoWeek")
          .format("YYYY-MM-DD");
        weekEnd = moment(page.file.name, "YYYY-MM-DD")
          .endOf("isoWeek")
          .format("YYYY-MM-DD");
      } else if (page.file.name.match(/\d{4}-W\d{2}/)) {
        weekStart = moment(page.file.name, "YYYY-[W]WW")
          .startOf("isoWeek")
          .format("YYYY-MM-DD");
        weekEnd = moment(page.file.name, "YYYY-[W]WW")
          .endOf("isoWeek")
          .format("YYYY-MM-DD");
      } else {
        throw new Error("Can't get week");
      }

      return [weekStart, weekEnd];
    }

    monthEdges(page: Page): [string, string] {
      let monthStart: string | null = null;
      let monthEnd: string | null = null;

      if (page.file.name.match(/\d{4}-\d{2}/)) {
        monthStart = moment(page.file.name, "YYYY-MM")
          .startOf("month")
          .format("YYYY-MM-DD");
        monthEnd = moment(page.file.name, "YYYY-MM")
          .endOf("month")
          .format("YYYY-MM-DD");
      } else {
        throw new Error("Can't get month edges");
      }

      return [monthStart, monthEnd];
    }

    year(page: Page): string {
      return page.file.name.slice(0, 4);
    }

    /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
    /* ~~~~~                        list of pages                         ~~~~~ */
    /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
    weekPages(page: Page) {
      const [weekStart, weekEnd] = this.weekEdges(page);

      return this.dv
        .pages('"Diary/Daily"')
        .filter(
          (file: Page) =>
            file.file.name >= weekStart &&
            file.file.name <= weekEnd &&
            file.file.name.length == 10,
        )
        .sort((a: Page, b: Page) => a.file.name.localeCompare(b.file.name));
    }

    monthPages(page: Page) {
      const [monthStart, monthEnd] = this.monthEdges(page);

      return this.dv
        .pages('"Diary/Daily"')
        .filter(
          (file: Page) =>
            file.file.name >= monthStart &&
            file.file.name <= monthEnd &&
            file.file.name.length == 10,
        )
        .sort((a: Page, b: Page) => a.file.name.localeCompare(b.file.name));
    }

    yearPages(page: Page) {
      const year = this.year(page);

      return this.dv
        .pages('"Diary/Daily"')
        .filter(
          (file: Page) =>
            file.file.name.slice(0, 4) == year && file.file.name.length == 10,
        )
        .sort((a: Page, b: Page) => a.file.name.localeCompare(b.file.name));
    }

    monthsPages(page: Page) {
      const year = this.year(page);
      return this.dv
        .pages('"Diary/Monthly"')
        .filter((file: Page) => file.file.name.startsWith(year)) // Фильтруем по году
        .sort((a: Page, b: Page) => a.file.name.localeCompare(b.file.name));
    }

    weeksByMonthPages(page: Page) {
      const currentMonth = this.monthPageName(page);
      const monthStart = moment(currentMonth, "YYYY-MM")
        .startOf("month")
        .startOf("isoWeek")
        .format("YYYY-MM-DD");
      const monthEnd = moment(currentMonth, "YYYY-MM")
        .endOf("month")
        .endOf("isoWeek")
        .format("YYYY-MM-DD");

      return this.dv
        .pages('"Diary/Weekly"')
        .filter((file: Page) => file.file.name.length == 8)
        .filter((file: Page) => {
          const fileWeek = moment(file.file.name, "YYYY-[W]WW")
            .startOf("isoWeek")
            .format("YYYY-MM-DD");
          return fileWeek >= monthStart && fileWeek <= monthEnd;
        })
        .sort((a: Page, b: Page) => a.file.name.localeCompare(b.file.name));
    }

    /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
    /* ~~~~~                          page names                          ~~~~~ */
    /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
    nextDayPageName(page: Page): string {
      const currentDate = moment(page.file.name, "YYYY-MM-DD");
      return currentDate.add(1, "day").format("YYYY-MM-DD");
    }

    prevDayPageName(page: Page): string {
      const currentDate = moment(page.file.name, "YYYY-MM-DD");
      return currentDate.subtract(1, "day").format("YYYY-MM-DD");
    }

    weekPageName(page: Page): string {
      if (page.file.name.match(/\d{4}-\d{2}-\d{2}/)) {
        const week = moment(page.file.name, "YYYY-MM-DD").format(
          "YYYY-[W]WW",
        );
        return week;
      } else if (page.file.name.match(/\d{4}-W\d{2}/)) {
        return page.file.name;
      } else {
        throw new Error("Can't get week page name");
      }
    }

    monthPageName(page: Page): string {
      if (page.file.name.match(/\d{4}-\d{2}-\d{2}/)) {
        return moment(page.file.name, "YYYY-MM-DD").format("YYYY-MM");
      } else if (page.file.name.match(/\d{4}-W\d{2}/)) {
        return moment(page.file.name, "YYYY-[W]WW").format("YYYY-MM");
      } else if (page.file.name.match(/\d{4}-\d{2}/)) {
        return page.file.name;
      } else {
        throw new Error("Can't get month page name");
      }
    }

    yearPageName(page: Page): string {
      if (page.file.name.match(/\d{4}-\d{2}-\d{2}/)) {
        return moment(page.file.name, "YYYY-MM-DD").format("YYYY");
      } else if (page.file.name.match(/\d{4}-W\d{2}/)) {
        return moment(page.file.name, "YYYY-[W]WW").format("YYYY");
      } else if (page.file.name.match(/\d{4}-\d{2}/)) {
        return moment(page.file.name, "YYYY-MM").format("YYYY");
      } else {
        throw new Error("Can't get year page name");
      }
    }

    /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
    /* ~~~~~                         single pages                         ~~~~~ */
    /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
    weekPage(page: Page): Page | undefined {
      const week = this.weekPageName(page);
      return this.dv
        .pages('"Diary/Weekly"')
        .filter((file: Page) => file.file.name === week)
        .first();
    }

    monthPage(page: Page): Page | undefined {
      const month = this.monthPageName(page);
      return this.dv
        .pages('"Diary/Monthly"')
        .filter((file: Page) => file.file.name === month)
        .first();
    }

    yearPage(page: Page): Page | undefined {
      const year = this.yearPageName(page);
      return this.dv
        .pages('"Diary/Yearly"')
        .filter((file: Page) => file.file.name === year)
        .first();
    }
  }
