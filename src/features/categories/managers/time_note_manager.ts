import Item from "../models/item";
import { TimeNoteState } from "../state/time_note_holder";

export default class TimeNoteManager {
  constructor() {}

  static calc(items: Item[], pages: Record<string, any>[]): TimeNoteState {
    const dates = new Set(items.map((item) => item.date));
    const fullIntervalMinutes =
      new Set(items.map((item) => item.date)).size * 24 * 60;
    const countedMinutes = items.reduce((acc, item) => acc + item.minutes, 0);
    const specifiedIntervalMinutesList = pages
      .filter((page) => !!dates.has(page.file.name))
      .map((page) => this.calcDailyTotalTime(page))
      .filter((val) => val != null);

    let specifiedIntervalMinutes = null;
    if (specifiedIntervalMinutesList.length > 0) {
      specifiedIntervalMinutes = specifiedIntervalMinutesList.reduce(
        (acc, val) => acc + val,
        0
      );
    }

    let minutesStart = null;
    let minutesEnd = null;
    let missingMinutes = null;
    if (pages.length == 1) {
      const page = pages[0];
      const specified = this.calcDailyTotalTime(page, true);
      if (specified != null) {
        missingMinutes = specified - countedMinutes;
      }
      minutesStart = this.timeToMinutes(page["Подъём"]);
      minutesEnd = this.timeToMinutes(page["Отбой"]);
    }

    return {
      fullIntervalMinutes,
      countedMinutes,
      specifiedIntervalMinutes,
      minutesStart,
      minutesEnd,
      missingMinutes,
    };
  }

  static calcDailyTotalTime(
    page: Record<string, any>,
    useNow: boolean = false
  ): number | null {
    const start = this.timeToMinutes(page["Подъём"]);
    let end =
      this.timeToMinutes(page["Отбой"]) ??
      (useNow ? new Date().getHours() * 60 + new Date().getMinutes() : null);

    if (start == null || end == null) {
      return null;
    }

    if (end < start) {
      end += 24 * 60;
    }

    return end - start;
  }

  static timeToMinutes(time?: string): number | null {
    if (time == null || time.trim() == "") {
      return null;
    }

    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  }
}
