import { Item } from "./item";

export interface CategoryData {
  root: Item;
  items: Item[];
}

export type HistoryDayInfo = {
  date: string;
} & CategoryData;

export type HistoryInfo = HistoryDayInfo[];
