export interface CategoryPackYaml {
  type: string;
  prettyName: string;
  categories: Array<{
    name: string;
    color: string;
    parents?: string[];
    skipOnDiagramm?: boolean;
    hideOnLineChart?: boolean;
  }>;
  isCertain?: boolean;
}

export default interface CategoriesYaml {
  fastButtonsCategories: {
    category: string;
    text: string;
  }[];
  options: {
    discardCommentsLevel: number;
    itemsFieldName: string;
  };
  categoriesPacks: CategoryPackYaml[];
  otherCategory: {
    name: string;
    color: string;
    skipOnDiagramm: boolean;
  };
}
