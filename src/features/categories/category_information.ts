export class CategoryInformation {
  sub: [string, number][];
  com: [string, number][];
  total: number;
  totalWithoutBase: number;
  totalDailyTime: number;

  constructor(
      sub: [string, number][],
      com: [string, number][],
      total: number,
      totalWithoutBase: number,
      totalDailyTime: number
  ) {
      this.sub = sub;
      this.com = com;
      this.total = total;
      this.totalWithoutBase = totalWithoutBase;
      this.totalDailyTime = totalDailyTime;
  }

  add(other: CategoryInformation) {
    let sub: Map<string, number> = new Map(this.sub);
    let com: Map<string, number> = new Map(this.com);

    other.sub.forEach(function (row) {
      sub.set(row[0], (sub.get(row[0]) || 0) + row[1]);
    });

    other.com.forEach(function (row) {
      com.set(row[0], (com.get(row[0]) || 0) + row[1]);
    });

    const subArray: [string, number][] = Array.from(sub).sort((a, b) => b[1] - a[1]);
    const comArray: [string, number][] = Array.from(com).sort((a, b) => b[1] - a[1]);

    return new CategoryInformation(
      subArray,
      comArray,
      this.total + other.total,
      this.totalWithoutBase + other.totalWithoutBase,
      this.totalDailyTime + other.totalDailyTime,
    );
  }
}