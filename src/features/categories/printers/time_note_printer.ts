import DvApi from "src/domain/interfaces/dv_api";
import TimeNoteHolder from "../state/time_note_holder";
import { formatMinutes } from "../models/item";
import CategoryPagesHolder from "../state/category_pages_holder";
import TimeNoteManager from "../managers/time_note_manager";

export default class TimeNotePrinter {
  constructor(
    private dv: () => DvApi,
    private timeNoteHolder: TimeNoteHolder,
    private categoryPagesHolder: CategoryPagesHolder
  ) {}

  buildTimeNote(little: boolean = false, dayTime: boolean = false): void {
    const container = document.createElement(!little ? "div" : "span");

    const updateContent = () => {
      try {
        const state = this.timeNoteHolder.state!;
        const specified = this._calcSpecifiedIntervalMinutes();
        const calculated = state.countedMinutes;
        const missing = specified - calculated;

        if (little) {
          if (missing == 0) {
            container.textContent = "";
          } else {
            container.textContent =
              missing > 0
                ? ` | -${formatMinutes(missing)}`
                : ` | +${formatMinutes(-missing)}`;
          }

          return;
        }

        container.innerHTML = `Итого: ${formatMinutes(calculated)}`;
        if (missing != 0) {
          container.innerHTML += `<br/>Должно: ${formatMinutes(specified)}`;
          container.innerHTML +=
            missing > 0
              ? `<br/>Нехватка: ${formatMinutes(missing)}`
              : `<br/>Избыток: ${formatMinutes(-missing)}`;
        }

        if (!dayTime) {
          return;
        }

        const daysCount = this.categoryPagesHolder.state.filter(
          (page) => page["Подъём"] && page["Отбой"]
        ).length;

        const averageDayTime = Math.round(specified / daysCount);
        const averageSleepTime = 24 * 60 - averageDayTime;

        container.innerHTML += `<br/>День: ${formatMinutes(averageDayTime)}`;
        container.innerHTML += `<br/>Сон: ${formatMinutes(averageSleepTime)}`;
      } catch (e) {
        container.innerHTML = "";
      }
    };

    if (!little) {
      container.style.paddingBottom = "8px";
    }

    updateContent();
    setInterval(updateContent, 1000);
    this.dv().el(little ? "span" : "div", container);
  }

  private _calcSpecifiedIntervalMinutes(): number {
    const fromState = this.timeNoteHolder.state!.specifiedIntervalMinutes;
    if (fromState != null) {
      return fromState;
    }

    if (this.categoryPagesHolder.state.length != 1) {
      throw new Error("TimeNotePrinter: pages.length != 1");
    }

    const page = this.categoryPagesHolder.state.first()!;
    const totalTime = TimeNoteManager.calcDailyTotalTime(page, true);
    if (totalTime == null) {
      throw new Error("TimeNotePrinter: totalTime == null");
    }

    return totalTime;
  }
}
