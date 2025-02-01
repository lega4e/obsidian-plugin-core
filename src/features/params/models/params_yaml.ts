export interface ParamYaml {
	name: string;
	order: number;
	color?: string;
}

export interface ParamsYaml {
	params: ParamYaml[];
} 