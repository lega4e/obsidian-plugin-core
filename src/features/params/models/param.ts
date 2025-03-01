export interface ParamYaml {
  name: string;
  order: number;
  color?: string;
  hiddenOnChart?: boolean;
}

export interface ParamsYaml {
  params: ParamYaml[];
}

export class Param {
  constructor(
    public name: string,
    public order: number,
    public values: [string, number][],
    public color?: string,
    public hiddenOnChart?: boolean,
  ) {}
}