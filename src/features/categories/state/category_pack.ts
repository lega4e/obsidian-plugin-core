interface CategoryPackYaml {
  type: string;
  prettyName: string;
  categories: Array<{
    name: string;
    color?: string;
    parents?: string[];
    skipOnDiagramm?: boolean;
    hideOnLineChart?: boolean;
  }>;
  isCertain?: boolean;
}

interface CategoriesYaml {
  options: {
    discardComments: number;
  };
  categories_packs: CategoryPackYaml[];
  otherCategory: {
    name: string;
    color: string;
    skipOnDiagramm: boolean;
  };
}