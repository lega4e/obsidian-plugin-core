export class Category {
    private name: string;
    private parentName: string | null;
    private parentCategoriesMap: Map<string, Category> | null;

    constructor(name: string, parentName: string | null = null, parentCategoriesMap: Map<string, Category> | null = null) {
        this.name = name;
        this.parentName = parentName;
        this.parentCategoriesMap = parentCategoriesMap;
    }

    toString() {
      return `Категория: ${this.name}${this.parentName ? `, Родительская категория: ${this.parentName}` : ""}`;
    }

    parentCategory() {
      return this.parentCategoriesMap == null
        ? null
        : this.parentCategoriesMap.get(this.parentName);
    }
  }


