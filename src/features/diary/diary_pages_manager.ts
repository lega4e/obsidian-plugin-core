import { Page } from "../../domain/interfaces/page";
import { DvApi } from "../../domain/interfaces/dv_api";
import { moment } from "obsidian";

export class DiaryPagesManager {
	private dv: DvApi;

	constructor(dv: DvApi) {
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

	monthWeekEdges(page: Page): [string, string] {
		let monthStart: string | null = null;
		let monthEnd: string | null = null;

		if (page.file.name.match(/\d{4}-\d{2}/)) {
			const month = parseInt(page.file.name.slice(5, 7));
			const year = page.file.name.slice(0, 4);
			const weekStart = (month - 1) * 4 + 1;
			const weekEnd = month * 4;

			monthStart = moment(`${year}-W${String(weekStart).padStart(2, "0")}`)
				.startOf("isoWeek")
				.format("YYYY-MM-DD");
			monthEnd = moment(`${year}-W${String(weekEnd).padStart(2, "0")}`)
				.endOf("isoWeek")
				.format("YYYY-MM-DD");
		} else {
			throw new Error("Can't get month edges");
		}

		return [monthStart, monthEnd];
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

		return [
			...this.dv
				.pages('"Diary/Daily"')
				.filter(
					(file: Page) =>
						file.file.name >= weekStart &&
						file.file.name <= weekEnd &&
						file.file.name.length == 10,
				),
		].sort((a: Page, b: Page) => a.file.name.localeCompare(b.file.name));
	}

	monthPages(page: Page) {
		const [monthStart, monthEnd] = this.monthEdges(page);

		return [
			...this.dv
				.pages('"Diary/Daily"')
				.filter(
					(file: Page) =>
						file.file.name >= monthStart &&
						file.file.name <= monthEnd &&
						file.file.name.length == 10,
				),
		].sort((a: Page, b: Page) => a.file.name.localeCompare(b.file.name));
	}

	yearPages(page: Page) {
		const year = this.year(page);

		return [
			...this.dv
				.pages('"Diary/Daily"')
				.filter(
					(file: Page) =>
						file.file.name.slice(0, 4) == year && file.file.name.length == 10,
				),
		].sort((a: Page, b: Page) => a.file.name.localeCompare(b.file.name));
	}

	monthsPages(page: Page) {
		const year = this.year(page);
		return [
			...this.dv
				.pages('"Diary/Monthly"')
				.filter((file: Page) => file.file.name.startsWith(year)),
		].sort((a: Page, b: Page) => a.file.name.localeCompare(b.file.name));
	}

	weeksByMonthPages(page: Page) {
		const [monthStart, monthEnd] = this.monthWeekEdges(page);

		return [
			...this.dv
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
			const week = moment(page.file.name, "YYYY-MM-DD").format("YYYY-[W]WW");
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

	nextWeekPageName(page: Page): string {
		if (page.file.name.match(/\d{4}-W\d{2}/)) {
			return moment(page.file.name, "YYYY-[W]WW")
				.add(1, "week")
				.format("YYYY-[W]WW");
		}
		return moment(page.file.name, "YYYY-MM-DD")
			.add(1, "week")
			.format("YYYY-[W]WW");
	}

	prevWeekPageName(page: Page): string {
		if (page.file.name.match(/\d{4}-W\d{2}/)) {
			return moment(page.file.name, "YYYY-[W]WW")
				.subtract(1, "week")
				.format("YYYY-[W]WW");
		}
		return moment(page.file.name, "YYYY-MM-DD")
			.subtract(1, "week")
			.format("YYYY-[W]WW");
	}

	nextMonthPageName(page: Page): string {
		if (page.file.name.match(/\d{4}-\d{2}$/)) {
			return moment(page.file.name, "YYYY-MM")
				.add(1, "month")
				.format("YYYY-MM");
		}
		return moment(page.file.name, "YYYY-MM-DD")
			.add(1, "month")
			.format("YYYY-MM");
	}

	prevMonthPageName(page: Page): string {
		if (page.file.name.match(/\d{4}-\d{2}$/)) {
			return moment(page.file.name, "YYYY-MM")
				.subtract(1, "month")
				.format("YYYY-MM");
		}
		return moment(page.file.name, "YYYY-MM-DD")
			.subtract(1, "month")
			.format("YYYY-MM");
	}

	nextYearPageName(page: Page): string {
		return moment(page.file.name.slice(0, 4), "YYYY")
			.add(1, "year")
			.format("YYYY");
	}

	prevYearPageName(page: Page): string {
		return moment(page.file.name.slice(0, 4), "YYYY")
			.subtract(1, "year")
			.format("YYYY");
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
