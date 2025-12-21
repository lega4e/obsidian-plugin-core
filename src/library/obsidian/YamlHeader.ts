import { App, normalizePath, TFile } from "obsidian";
import * as jsyaml from "js-yaml";

export default class YamlHeader {
  constructor(private app: () => App) {}

  /**
   * Получает текущий YAML-фронтматтер из файла.
   */
  async get<T extends Record<string, any>>(
    rawFile: TFile | string
  ): Promise<T | null> {
    let file: TFile;
    if (typeof rawFile === "string") {
      const absFile = this.app().vault.getAbstractFileByPath(
        normalizePath(rawFile)
      );
      if (absFile instanceof TFile) {
        file = absFile;
      } else {
        console.error(`Can't find file '${rawFile}'`);
        return null;
      }
    } else {
      file = rawFile;
    }

    const content = await this.app().vault.read(file);
    const yamlMatch = content.match(/^---\n([\s\S]+?)\n---/);

    if (!yamlMatch) {
      return null;
    }

    try {
      return jsyaml.load(yamlMatch[1]) as T;
    } catch (e) {
      console.error("Ошибка парсинга YAML:", e);
      return null;
    }
  }

  /**
   * Обновляет YAML-фронтматтер в файле.
   */
  async update<T extends Record<string, any>>(
    file: TFile,
    newFrontmatter: T
  ): Promise<void> {
    let content = await this.app().vault.read(file);
    const yamlMatch = content.match(/^---\n([\s\S]+?)\n---/);

    if (!yamlMatch) {
      console.error("Файл не содержит YAML-фронтматтера.");
      return;
    }

    const newYaml = `---\n${jsyaml.dump(newFrontmatter, {
      lineWidth: -1,
    })}\n---`;
    content = content.replace(yamlMatch[0], newYaml);

    await this.app().vault.modify(file, content);
  }

  /**
   * Обновляет поле в YAML-фронтматтере.
   */
  async updateField<U>(
    file: TFile,
    field: string,
    update: (value: U | undefined) => U
  ): Promise<void> {
    const frontmatter = await this.get(file);
    if (!frontmatter) return;

    (frontmatter as Record<string, any>)[field] = update(frontmatter[field]);
    await this.update(file, frontmatter);
  }
}
