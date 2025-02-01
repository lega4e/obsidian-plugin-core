import { Category, CategoryPack } from "../models/category";
import { Item } from "../models/item";
import { DvApi } from "src/domain/interfaces/dv_api";

export class CategoryManager {
  private dv: DvApi;
  private packs: CategoryPack[] = [];
  private certainPack: CategoryPack | null = null;
  private otherCategory: Category | null = null;

  constructor(dv: DvApi, categoriesPath: string) {
    this.dv = dv;
    this._parseCategories(categoriesPath);
  }

  calculate(pages: Record<string, any>[], packType: string): [Item, Item[]] {
    const pack = this.packs.find((p) => p.type == packType);
    if (!pack) {
      throw new Error(`Pack type ${packType} not found`);
    }

    this._loadItems(pages);
    const rootCategory = new Category(pack.prettyName, [], pack.categories);
    let [root, items] = rootCategory.summarizeWithItems();
    items = items.filter((item) => item.totalMinutes != 0);
    items = items.sort((a, b) => b.totalMinutes - a.totalMinutes);
    return [root, items];
  }

  getOtherCategory(): Category {
    return this.otherCategory!;
  }

  private _parseCategories(categoriesPath: string): void {
    this.packs = [];
    this.certainPack = null;
    this.otherCategory = null;

    const allCategories = new Map<string, Category>();
    const file = this.dv.page(categoriesPath);

    if (!file) {
      throw new Error(`Can't find file '${categoriesPath}'`);
    }

    const parsedData = file as unknown as CategoriesYaml;

    this.otherCategory = new Category(
      parsedData.otherCategory.name,
      [],
      [],
      parsedData.otherCategory.color,
      parsedData.otherCategory.skipOnDiagramm,
    );

    for (const packYaml of parsedData.categories_packs) {
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
        );

        parents.forEach((parent) => parent.children.push(category));
        allCategories.set(packYaml.type + "." + categoryYaml.name, category);
        pack.categories.push(category);
      }

      if (packYaml.isCertain) {
        this.certainPack = pack;
      }

      this.packs.push(pack);
    }
  }

  private _clearCategoriesItems() {
    for (const pack of this.packs) {
      for (const category of pack.categories) {
        category.items = [];
      }
    }
  }

  private _loadItems(pages: Record<string, any>[]): void {
    this._clearCategoriesItems();
    const entries = pages
      .map((page) => page["Времяучёт"])
      .filter((entry) => entry)
      .flat();

    for (const entry of entries) {
      const match = entry.match(
        /^([^\d()]*)\s*(?:\((.*?)\))?\s*(?:(\d+)ч\.?)?\s*(?:(\d+)м\.?)?$/,
      );

      if (match) {
        const category = match[1].trim();
        const minutes =
          parseInt(match[3] || "0") * 60 + parseInt(match[4] || "0");

        const certainCategory = this.certainPack?.find(category);
        if (!certainCategory) {
          throw new Error(`Не найдено конкретной категории ${category}`);
        }

        certainCategory.items.push(
          new Item(certainCategory, minutes, match[2]),
        );
      } else {
        throw new Error(`error with match ${entry} | ${match}`);
      }
    }
  }
}

const _tstyaml = `
otherCategory:
  name: "Остальное"
  color: "rgba(87, 117, 144, 0.7)" # Графит

categories_packs:
  - type: common
    prettyName: "Общие"
    categories:
      - name: Базированный
        color: "rgba(201, 203, 207, 0.7)" # Серый
        skipOnDiagramm: true
      - name: Успешный
        color: "rgba(255, 159, 64, 0.7)" # Оранжевый
      - name: Телесный
        color: "rgba(255, 140, 203, 0.7)" # Розовый
      - name: Духовный
        color: "rgba(75, 192, 192, 0.7)" # Бирюзовый
      - name: Умелый
        color: "rgba(0, 128, 255, 0.7)" # Ярко-синий (электрик)
      - name: Деятельный
        color: "rgba(255, 99, 132, 0.7)" # Красный
      - name: Весёлый
        color: "rgba(255, 206, 86, 0.7)" # Желтый
      - name: Проёбушек
        color: "rgba(153, 102, 255, 0.7)" # Фиолетовый
      - name: Лёгкий
        color: "rgba(123, 239, 178, 0.7)" # Светло-зеленый
      - name: Интересный
        color: "rgba(54, 162, 235, 0.7)" # Синиий

  - type: sub
    prettyName: "Подкатегории"
    categories:
    - name: Здоровье
      parent: common.Базированный
    - name: Еда
      parent: common.Базированный
    - name: Деньги
      parent: common.Базированный
    - name: Быт
      parent: common.Базированный
    - name: Админ
      parent: common.Базированный
    - name: Уют
      parent: common.Успешный
    - name: Кабанчик
      parent: common.Успешный
    - name: Тело
      parent: common.Телесный
    - name: Эрудиция
      parent: common.Духовный
    - name: Чувства
      parent: common.Духовный
    - name: Образование
      parent: common.Умелый
    - name: Дело
      parent: common.Деятельный
    - name: Развлечения
      parent: common.Весёлый
    - name: Потери
      parent: common.Проёбушек
    - name: Отдых
      parent: common.Лёгкий
    - name: Контент
      parent: common.Интересный

  - type: certain
    prettyName: "Конкретные"
    isCertain: true
    categories:
    - name: Здоровье
      parent: sub.Здоровье
    - name: Поесть
      parent: sub.Еда
    - name: Готовка
      parent: sub.Еда
    - name: Продукты
      parent: sub.Еда
    - name: Работа
      parent: sub.Деньги
    - name: Быт
      parent: sub.Быт
    - name: Кабанчик
      parent: sub.Кабанчик
    - name: Спортзал
      parent: sub.Тело
    - name: Кауч-бот
      parent: sub.Дело
    - name: Коммуны
      parent: sub.Дело
    - name: Пианино
      parent: sub.Чувства
    - name: Лекции
      parent: sub.Контент
    - name: Подкасты
      parent: sub.Контент
    - name: Публицистика
      parent: sub.Эрудиция
    - name: Худлит
      parent: sub.Чувства
    - name: Спецлит
      parent: sub.Образование
    - name: Ломовой
      parent: sub.Админ
    - name: Дорога
      parent: sub.Потери
    - name: Отдых
      parent: sub.Отдых
    - name: Социалочка
      parent: sub.Развлечения
    - name: Продуктивность
      parent: sub.Кабанчик
    - name: Комната
      parent: sub.Уют
    - name: Публит
      parent: sub.Эрудиция
    - name: fresh
      parent: sub.Дело
    - name: Фильмы
      parent: sub.Развлечения
    - name: Нихуяшечки
      parent: sub.Потери
    - name: Медитация
      parent: sub.Отдых
    - name: Random Event Bot
      parent: sub.Дело
    - name: Дневник
      parent: sub.Чувства
    - name: Фриланс
      parent: sub.Дело
    - name: Сашня
      parent: sub.Развлечения
    - name: Картотека
      parent: sub.Кабанчик
    - name: Костёр
      parent: sub.Дело
    - name: Нейросети
      parent: sub.Образование
`;
