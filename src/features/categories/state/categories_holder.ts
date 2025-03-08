import { inject } from "inversify";
import { TYPES } from "src/domain/di/types";
import { DvApi } from "src/domain/interfaces/dv_api";
import { DerivedValueNotifier } from "src/utils/value_notifier";
import { CategoriesConfigHolder } from "./categories_config_holder";
import { Category, CategoryPack } from "../models/category";

export interface CategoriesState {
  packs: CategoryPack[];
  certainPack: CategoryPack;
  otherCategory: Category;
  discardComments: number;
}

export class CategoriesHolder extends DerivedValueNotifier<
  CategoriesState | undefined
> {
  constructor(
    @inject(TYPES.DvApi) private dv: () => DvApi,
    @inject(TYPES.CategoriesConfigHolder)
    categoriesConfigHolder: CategoriesConfigHolder,
  ) {
    super([categoriesConfigHolder], ([config], _) =>
      !config.value ? undefined : CategoriesHolder.calc(config.value),
    );
  }

  static calc(config: CategoriesYaml): CategoriesState | undefined {
    let packs: CategoryPack[] = [];
    let certainPack: CategoryPack | null = null;

    const allCategories = new Map<string, Category>();

    for (const packYaml of config.categories_packs) {
      let pack = new CategoryPack(packYaml.type, [], packYaml.prettyName);

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

        let category = new Category(
          categoryYaml.name,
          parents,
          [],
          categoryYaml.color,
          categoryYaml.skipOnDiagramm === true,
          categoryYaml.hideOnLineChart ?? true,
        );

        parents.forEach((parent) => parent.children.push(category));
        allCategories.set(packYaml.type + "." + categoryYaml.name, category);
        pack.categories.push(category);
      }

      if (packYaml.isCertain) {
        certainPack = pack;
      }

      packs.push(pack);
    }

    return {
      packs,
      certainPack: certainPack!,
      otherCategory: new Category(
        config.otherCategory.name,
        [],
        [],
        config.otherCategory.color,
        config.otherCategory.skipOnDiagramm,
      ),
      discardComments: config.options.discardComments ?? 0,
    };
  }
}