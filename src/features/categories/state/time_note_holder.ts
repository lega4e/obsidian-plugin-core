import LazyDerivedValueNotifier from "src/utils/notifiers/lazy_derived_notifier";
import CalculatedItemHolder from "./calculated_item_holder";
import TimeNoteManager from "../managers/time_note_manager";
import CategoryPagesHolder from "./category_pages_holder";

export interface TimeNoteState {
  fullIntervalMinutes: number; // Общее время суток/недели/месяца/года
  countedMinutes: number; // Сумма айтемов
  specifiedIntervalMinutes: number | null; // Отбой - подъём ?? now()
  minutesStart: number | null; // Подъём (для одиночных страниц)
  minutesEnd: number | null; // Отбой (для одиночных страниц)
  missingMinutes: number | null; // Сколько минут не хватает (для одиночных страниц)
}

export default class TimeNoteHolder extends LazyDerivedValueNotifier<TimeNoteState> {
  constructor(
    itemsHolder: CalculatedItemHolder,
    pagesHolder: CategoryPagesHolder
  ) {
    super([itemsHolder, pagesHolder], () =>
      TimeNoteManager.calc(itemsHolder.state, pagesHolder.state)
    );
  }
}
