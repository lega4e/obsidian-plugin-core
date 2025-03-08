import { Item } from "./item";

export interface CategoryData {
  title?: string;
  root: Item;
  items: Item[];
}

export type HistoryDayInfo = {
  date: string;
} & CategoryData;

export type HistoryInfo = HistoryDayInfo[];
