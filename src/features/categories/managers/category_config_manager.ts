import CategoriesYaml from "../models/categories_yaml";
import Category, { CategoryPack } from "../models/category";
import { CategoriesState } from "../state/categories_holder";

export default class CategoryConfigManager {
  static calc(config: CategoriesYaml): CategoriesState | null {
    const packs: CategoryPack[] = [];
    let certainPack: CategoryPack | null = null;

    const allCategories = new Map<string, Category>();

    for (const packYaml of config.categoriesPacks) {
      const pack: CategoryPack = {
        type: packYaml.type,
        categories: [],
        prettyName: packYaml.prettyName,
      };

      for (const categoryYaml of packYaml.categories) {
        if (allCategories.has(packYaml.type + "." + categoryYaml.name)) {
          throw new Error(`Category ${categoryYaml.name} already exists`);
        }

        const parents =
          categoryYaml.parents?.map((name) => {
            const parent = allCategories.get(name);
            if (!parent) {
              throw new Error(`Parent ${name} not found`);
            }
            return parent;
          }) || [];

        const name = packYaml.type + "." + categoryYaml.name;
        const category: Category = {
          name,
          prettyName: categoryYaml.name,
          parents,
          children: [],
          color: categoryYaml.color,
          skipOnDiagramm: categoryYaml.skipOnDiagramm === true,
          hideOnLineChart: categoryYaml.hideOnLineChart ?? true,
        };

        parents.forEach((parent) => parent.children.push(category));
        allCategories.set(name, category);
        pack.categories.push(category);
      }

      if (packYaml.isCertain) {
        certainPack = pack;
      }

      packs.push(pack);
    }

    const val = {
      packs,
      certainPack: certainPack!,
      allCategories: allCategories,
      otherCategory: {
        name: config.otherCategory.name,
        prettyName: config.otherCategory.name,
        parents: [],
        children: [],
        color: config.otherCategory.color ?? null,
        skipOnDiagramm: config.otherCategory.skipOnDiagramm ?? false,
        hideOnLineChart: false,
      },
      discardCommentsLevel: config.options.discardCommentsLevel ?? 99,
      itemsFieldName: config.options.itemsFieldName,
    };

    return val;
  }
}
