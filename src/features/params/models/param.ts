export class Param {
  constructor(
    public name: string,
    public order: number,
    public values: [string, number][],
    public color?: string,
    public hiddenOnChart?: boolean,
  ) {}
}
