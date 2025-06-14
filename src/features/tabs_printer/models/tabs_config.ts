// COMMON
export default interface TabsPrinterConfig {
  packs: TabPack[];
}

export interface TabPack {
  id: string;
  tabs: Tab[];
}

export enum TabSource {
  params = "params",
  categories = "categories",
}

export interface Tab {
  title: string;
  source: TabSource;
}

// PARAMS
export enum TabParamsType {
  table = "table",
  history = "history",
}

export type TabParams = Tab & {
  source: TabSource.params;
  type: TabParamsType;
};

// export type TabParamsTable = TabParams & {
//   type: TabParamsType.table;
//   showPrev: boolean;
//   showNext: boolean;
// };

export type TabParamsHistory = TabParams & {
  type: TabParamsType.history;
};

// CATEGORIES
export enum TabCategoriesType {
  pie = "pie",
  history = "history",
  table = "table",
}

export type TabCategories = Tab & {
  source: TabSource.categories;
  type: TabCategoriesType;
};

export type TabCategoriesPie = TabCategories & {
  type: TabCategoriesType.pie;
  packType: string;
};

export type TabCategoriesHistory = TabCategories & {
  type: TabCategoriesType.history;
  packType: string;
};

export type TabCategoriesTable = TabCategories & {
  type: TabCategoriesType.table;
  packTypes: string[];
  avg: boolean;
};
