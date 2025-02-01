import { Category } from "./category";

export function formatMinutes(totalMinutes: number): string {
  const minutes = totalMinutes % 60;
  const hours = Math.floor(totalMinutes / 60);

  return (
    `${hours != 0 ? hours.toString() + "ч." : ""} ` +
    `${minutes != 0 || hours == 0 ? minutes.toString() + "м." : ""}`
  ).trim();
}

export class Item {
  public category: Category | undefined;
  public totalMinutes: number;
  public comment: string | undefined;
  public color: string | undefined;

  constructor(
    category: Category | undefined,
    totalMinutes: number,
    comment: string | undefined = undefined,
    color: string | undefined = undefined,
  ) {
    this.category = category;
    this.totalMinutes = totalMinutes;
    this.comment = comment;
    this.color = color;
  }

  toString() {
    return this.pretty();
  }

  pretty(): string {
    return formatMinutes(this.totalMinutes);
  }
}
