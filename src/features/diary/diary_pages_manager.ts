import Page from "../../domain/interfaces/page";
import type DvApi from "../../domain/interfaces/dv_api";
import { moment } from "obsidian";

export default class DiaryPagesManager {
  constructor(private dv: () => DvApi) {}

  isDay(value: string): boolean {
    return /^\d{4}-\d{2}-\d{2}$/.test(value);
  }

  isWeek(value: string): boolean {
    return /^\d{4}-W\d{2}$/.test(value);
  }

  isMonth(value: string): boolean {
    return /^\d{4}-\d{2}$/.test(value);
  }

  /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
  /* ~~~~~                            EDGES                             ~~~~~ */
  /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
  weekEdges(filename: string): [string, string] {
    let weekStart: string | null = null;
    let weekEnd: string | null = null;

    if (filename.match(/\d{4}-\d{2}-\d{2}/)) {
      weekStart = moment(filename, "YYYY-MM-DD")
        .startOf("isoWeek")
        .format("YYYY-MM-DD");
      weekEnd = moment(filename, "YYYY-MM-DD")
        .endOf("isoWeek")
        .format("YYYY-MM-DD");
    } else if (filename.match(/\d{4}-W\d{2}/)) {
      weekStart = moment(filename, "YYYY-[W]WW")
        .startOf("isoWeek")
        .format("YYYY-MM-DD");
      weekEnd = moment(filename, "YYYY-[W]WW")
        .endOf("isoWeek")
        .format("YYYY-MM-DD");
    } else {
      throw new Error("Can't get week");
    }

    return [weekStart, weekEnd];
  }

  monthWeekEdges(filename: string): [string, string] {
    let monthStart: string | null = null;
    let monthEnd: string | null = null;

    if (filename.match(/\d{4}-\d{2}/)) {
      monthStart = moment(filename, "YYYY-MM")
        .startOf("month")
        .startOf("isoWeek")
        .format("YYYY-MM-DD");

      monthEnd = moment(filename, "YYYY-MM")
        .endOf("month")
        .endOf("isoWeek")
        .format("YYYY-MM-DD");
    } else {
      throw new Error("Невозможно получить границы недель месяца");
    }

    return [monthStart, monthEnd];
  }

  monthEdges(filename: string): [string, string] {
    let monthStart: string | null = null;
    let monthEnd: string | null = null;

    if (filename.match(/\d{4}-\d{2}/)) {
      monthStart = moment(filename, "YYYY-MM")
        .startOf("month")
        .format("YYYY-MM-DD");
      monthEnd = moment(filename, "YYYY-MM")
        .endOf("month")
        .format("YYYY-MM-DD");
    } else {
      throw new Error("Can't get month edges");
    }

    return [monthStart, monthEnd];
  }

  year(filename: string): string {
    return filename.slice(0, 4);
  }

  /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
  /* ~~~~~                        list of pages                         ~~~~~ */
  /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
  weekPages(filename: string) {
    const [weekStart, weekEnd] = this.weekEdges(filename);

    return [
      ...this.dv()
        .pages('"Diary/Daily"')
        .filter(
          (file: Page) =>
            file.file.name >= weekStart &&
            file.file.name <= weekEnd &&
            file.file.name.length == 10
        ),
    ].sort((a: Page, b: Page) => a.file.name.localeCompare(b.file.name));
  }

  monthPages(filename: string) {
    const [monthStart, monthEnd] = this.monthEdges(filename);

    return [
      ...this.dv()
        .pages('"Diary/Daily"')
        .filter(
          (file: Page) =>
            file.file.name >= monthStart &&
            file.file.name <= monthEnd &&
            file.file.name.length == 10
        ),
    ].sort((a: Page, b: Page) => a.file.name.localeCompare(b.file.name));
  }

  yearPages(filename: string) {
    const year = this.year(filename);

    return [
      ...this.dv()
        .pages('"Diary/Daily"')
        .filter(
          (file: Page) =>
            file.file.name.slice(0, 4) == year && file.file.name.length == 10
        ),
    ].sort((a: Page, b: Page) => a.file.name.localeCompare(b.file.name));
  }

  monthsPages(filename: string) {
    const year = this.year(filename);
    return [
      ...this.dv()
        .pages('"Diary/Monthly"')
        .filter((file: Page) => file.file.name.startsWith(year)),
    ].sort((a: Page, b: Page) => a.file.name.localeCompare(b.file.name));
  }

  weeksByMonthPages(filename: string) {
    const [monthStart, monthEnd] = this.monthWeekEdges(filename);

    return [
      ...this.dv()
        .pages('"Diary/Weekly"')
        .filter((file: Page) => file.file.name.length == 8)
        .filter((file: Page) => {
          const fileWeek = moment(file.file.name, "YYYY-[W]WW")
            .startOf("isoWeek")
            .format("YYYY-MM-DD");
          return fileWeek >= monthStart && fileWeek <= monthEnd;
        }),
    ].sort((a: Page, b: Page) => a.file.name.localeCompare(b.file.name));
  }

  /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
  /* ~~~~~                          page names                          ~~~~~ */
  /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
  nextDayPageName(filename: string): string {
    const currentDate = moment(filename, "YYYY-MM-DD");
    return currentDate.add(1, "day").format("YYYY-MM-DD");
  }

  prevDayPageName(filename: string): string {
    const currentDate = moment(filename, "YYYY-MM-DD");
    return currentDate.subtract(1, "day").format("YYYY-MM-DD");
  }

  weekPageName(filename: string): string {
    if (filename.match(/\d{4}-\d{2}-\d{2}/)) {
      const week = moment(filename, "YYYY-MM-DD").format("YYYY-[W]WW");
      return week;
    } else if (filename.match(/\d{4}-W\d{2}/)) {
      return filename;
    } else {
      throw new Error("Can't get week page name");
    }
  }

  monthPageName(filename: string): string {
    if (filename.match(/\d{4}-\d{2}-\d{2}/)) {
      return moment(filename, "YYYY-MM-DD").format("YYYY-MM");
    } else if (filename.match(/\d{4}-W\d{2}/)) {
      return moment(filename, "YYYY-[W]WW").format("YYYY-MM");
    } else if (filename.match(/\d{4}-\d{2}/)) {
      return filename;
    } else {
      throw new Error("Can't get month page name");
    }
  }

  yearPageName(filename: string): string {
    if (filename.match(/\d{4}-\d{2}-\d{2}/)) {
      return moment(filename, "YYYY-MM-DD").format("YYYY");
    } else if (filename.match(/\d{4}-W\d{2}/)) {
      return moment(filename, "YYYY-[W]WW").format("YYYY");
    } else if (filename.match(/\d{4}-\d{2}/)) {
      return moment(filename, "YYYY-MM").format("YYYY");
    } else {
      throw new Error("Can't get year page name");
    }
  }

  nextWeekPageName(filename: string): string {
    if (filename.match(/\d{4}-W\d{2}/)) {
      const weekNum = parseInt(filename.slice(6));
      const year = parseInt(filename.slice(0, 4));

      if (weekNum === 52) {
        return `${year + 1}-W01`;
      }

      return moment(filename, "YYYY-[W]WW").add(1, "week").format("YYYY-[W]WW");
    }
    return moment(filename, "YYYY-MM-DD").add(1, "week").format("YYYY-[W]WW");
  }

  prevWeekPageName(filename: string): string {
    if (filename.match(/\d{4}-W\d{2}/)) {
      const weekNum = parseInt(filename.slice(6));
      const year = filename.slice(0, 4);

      if (weekNum === 2) {
        return `${year}-W01`;
      }

      return moment(filename, "YYYY-[W]WW")
        .subtract(1, "week")
        .format("YYYY-[W]WW");
    }
    return moment(filename, "YYYY-MM-DD")
      .subtract(1, "week")
      .format("YYYY-[W]WW");
  }

  nextMonthPageName(filename: string): string {
    if (filename.match(/\d{4}-\d{2}$/)) {
      return moment(filename, "YYYY-MM").add(1, "month").format("YYYY-MM");
    }
    return moment(filename, "YYYY-MM-DD").add(1, "month").format("YYYY-MM");
  }

  prevMonthPageName(filename: string): string {
    if (filename.match(/\d{4}-\d{2}$/)) {
      return moment(filename, "YYYY-MM").subtract(1, "month").format("YYYY-MM");
    }
    return moment(filename, "YYYY-MM-DD")
      .subtract(1, "month")
      .format("YYYY-MM");
  }

  nextYearPageName(filename: string): string {
    return moment(filename.slice(0, 4), "YYYY").add(1, "year").format("YYYY");
  }

  prevYearPageName(filename: string): string {
    return moment(filename.slice(0, 4), "YYYY")
      .subtract(1, "year")
      .format("YYYY");
  }

  /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
  /* ~~~~~                         single pages                         ~~~~~ */
  /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
  weekPage(filename: string): Page | undefined {
    const week = this.weekPageName(filename);
    return this.dv()
      .pages('"Diary/Weekly"')
      .filter((file: Page) => file.file.name === week)
      .first();
  }

  monthPage(filename: string): Page | undefined {
    const month = this.monthPageName(filename);
    return this.dv()
      .pages('"Diary/Monthly"')
      .filter((file: Page) => file.file.name === month)
      .first();
  }

  yearPage(filename: string): Page | undefined {
    const year = this.yearPageName(filename);
    return this.dv()
      .pages('"Diary/Yearly"')
      .filter((file: Page) => file.file.name === year)
      .first();
  }
}
