export interface ParamYaml {
  name: string;
  order: number;
  color?: string;
  hiddenOnChart?: boolean;
}

export interface ParamsYaml {
  params: ParamYaml[];
}
