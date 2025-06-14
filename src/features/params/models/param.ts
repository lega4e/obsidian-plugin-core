export default interface ParamsYaml {
  params: ParamYaml[];
}

export interface ParamYaml {
  name: string;
  order: number;
  color?: string;
  hiddenOnChart?: boolean;
}

export interface ParamValue {
  date: string;
  value: number;
}

export interface ParamInfo {
  name: string;
  order: number;
  color?: string;
  hiddenOnChart?: boolean;
}

export type Param = {
  value: number;
} & ParamInfo;

export type ParamHistory = {
  values: ParamValue[];
} & ParamInfo;
