export interface CategoryPack {
  type: string;
  categories: Category[];
  prettyName: string;
}

export default interface Category {
  name: string;
  prettyName: string;
  parents: Category[];
  children: Category[];
  color: string;
  skipOnDiagramm: boolean;
  hideOnLineChart: boolean;
}
