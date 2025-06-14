export function formatMinutes(totalMinutes: number): string {
  const minutes = Math.round(totalMinutes % 60);
  const hours = Math.floor(totalMinutes / 60);

  return totalMinutes == 0
    ? "0"
    : (
        `${hours != 0 ? hours.toString() + "ч." : ""} ` +
        `${minutes != 0 || hours == 0 ? minutes.toString() + "м." : ""}`
      ).trim();
}

export default interface Item {
  categoryName: string;
  minutes: number;
  date: string;
  comment: string | null;
}
