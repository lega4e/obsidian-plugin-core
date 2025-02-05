export interface AutocompleteOption {
  // Заголовок, отображаемый в списке подсказок
  label: string;
  // Значение (может использоваться для поиска или для дальнейшей обработки)
  value: string;
}

/**
 * Виджет автодополнения.
 * При создании принимает контейнер, в который добавляет поле ввода и список подсказок.
 */
export class AutocompleteInput {
  public container: HTMLElement;
  public inputElement: HTMLInputElement;
  public suggestionBox: HTMLElement;
  public options: AutocompleteOption[];
  public callback: (option: AutocompleteOption) => void;

  constructor({
    container,
    options,
    callback,
  }: {
    container: HTMLElement;
    options: AutocompleteOption[];
    callback: (option: AutocompleteOption) => void;
  }) {
    this.container = container;
    this.options = options;
    this.callback = callback;

    // Создаём поле ввода
    this.inputElement = document.createElement("input");
    this.inputElement.type = "text";
    this.inputElement.className = "autocomplete-input";

    // Устанавливаем стиль контейнера как relative для корректного позиционирования выпадающего списка
    this.container.style.position = "relative";

    // Создаём контейнер для подсказок
    this.suggestionBox = document.createElement("div");
    this.suggestionBox.className = "autocomplete-suggestions";

    // Оформление "выпадашки"
    this.suggestionBox.style.position = "absolute";
    this.suggestionBox.style.top = "100%";
    this.suggestionBox.style.left = "0";
    // this.suggestionBox.style.width = "100%";
    this.suggestionBox.style.zIndex = "1000";
    // this.suggestionBox.style.backgroundColor = "#fff";
    this.suggestionBox.style.border = "1px";
    // this.suggestionBox.style.boxShadow = "0 2px 4px rgba(0,0,0,0.2)";
    // this.suggestionBox.style.maxHeight = "200px";
    this.suggestionBox.style.overflowY = "auto";

    // Добавляем элементы в основной контейнер
    this.container.appendChild(this.inputElement);
    this.container.appendChild(this.suggestionBox);

    // Устанавливаем обработчик ввода
    this.inputElement.addEventListener("input", () => this.onInput());
    // Скрываем подсказки при клике вне контейнера
    document.addEventListener("click", (e) => this.onDocumentClick(e));
  }

  private onInput(): void {
    const query = this.inputElement.value.toLowerCase();
    // Очищаем список подсказок перед фильтрацией
    this.suggestionBox.innerHTML = "";

    if (!query) return;

    // Фильтруем варианты, где label содержит запрос
    const matches = this.options.filter((option) =>
      option.label.toLowerCase().includes(query),
    );

    // Отображаем найденные подсказки в виде выпадающего списка
    matches.forEach((match) => {
      const suggestionItem = document.createElement("div");
      suggestionItem.className = "autocomplete-suggestion-item";
      suggestionItem.textContent = match.label;
      // Стили для выпадающего элемента
      suggestionItem.style.padding = "4px 8px";
      suggestionItem.style.cursor = "pointer";
      suggestionItem.addEventListener("mouseover", () => {
        // suggestionItem.style.backgroundColor = "#f0f0f0";
      });
      suggestionItem.addEventListener("mouseout", () => {
        // suggestionItem.style.backgroundColor = "";
      });
      suggestionItem.addEventListener("click", () => {
        this.selectOption(match);
      });
      this.suggestionBox.appendChild(suggestionItem);
    });
  }

  private onDocumentClick(e: MouseEvent): void {
    if (!this.container.contains(e.target as Node)) {
      this.clearSuggestions();
    }
  }

  private clearSuggestions(): void {
    this.suggestionBox.innerHTML = "";
  }

  /**
   * Обработка выбора варианта.
   * При выборе значение ввода заменяется на выбранный вариант, а список подсказок очищается.
   */
  private selectOption(option: AutocompleteOption): void {
    this.inputElement.value = option.label;
    this.clearSuggestions();
    this.callback(option);
  }

  /**
   * Позволяет динамически обновлять список вариантов автодополнения.
   */
  public updateOptions(options: AutocompleteOption[]): void {
    this.options = options;
  }
}

// Создаём HTML и CSS компоненты с автодополнением на TypeScript
export function createDropdownWidget(options: string[]): HTMLDivElement {
  // Создаём контейнер для виджета
  const container: HTMLDivElement = document.createElement("div");
  container.style.position = "absolute";
  container.style.zIndex = "9999"; // Поверх всех элементов
  container.style.padding = "8px";
  container.style.borderRadius = "6px";
  container.style.backgroundColor = "var(--background-primary)";
  container.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.1)";
  container.style.width = "300px";

  // Поле ввода для поиска и автодополнения
  const input: HTMLInputElement = document.createElement("input");
  input.type = "text";
  input.placeholder = "Выберите вариант...";
  input.style.width = "100%";
  input.style.padding = "6px";
  input.style.border = "1px solid var(--background-modifier-border)";
  input.style.borderRadius = "4px";
  input.style.color = "var(--text-normal)";
  input.style.backgroundColor = "var(--background-primary)";

  // Список вариантов
  const list: HTMLUListElement = document.createElement("ul");
  list.style.margin = "8px 0 0";
  list.style.padding = "0";
  list.style.maxHeight = "200px"; // Ограничение по высоте с прокруткой
  list.style.overflowY = "auto";
  list.style.listStyle = "none";
  list.style.border = "1px solid var(--background-modifier-border)";
  list.style.borderRadius = "4px";
  list.style.backgroundColor = "var(--background-primary)";

  // Добавляем варианты в список
  options.forEach((option: string) => {
    const item: HTMLLIElement = document.createElement("li");
    item.textContent = option;
    item.style.padding = "6px";
    item.style.cursor = "pointer";
    item.style.color = "var(--text-normal)";

    // Подсветка при наведении
    item.addEventListener("mouseover", () => {
      item.style.backgroundColor = "var(--background-modifier-hover)";
    });
    item.addEventListener("mouseout", () => {
      item.style.backgroundColor = "transparent";
    });

    // Обработчик клика по элементу
    item.addEventListener("click", () => {
      input.value = option;
      list.style.display = "none"; // Скрыть список после выбора
    });

    list.appendChild(item);
  });

  // Фильтрация вариантов на основе ввода
  input.addEventListener("input", () => {
    const filter: string = input.value.toLowerCase();
    Array.from(list.children).forEach((item: Element) => {
      const listItem = item as HTMLLIElement;
      if (
        listItem.textContent &&
        listItem.textContent.toLowerCase().includes(filter)
      ) {
        listItem.style.display = "";
      } else {
        listItem.style.display = "none";
      }
    });
    list.style.display = "block"; // Показывать список при вводе
  });

  // Собираем виджет
  container.appendChild(input);
  container.appendChild(list);
  document.body.appendChild(container);

  // Позиционирование виджета на экране (пример: в центре экрана)
  container.style.top = "50%";
  container.style.left = "50%";
  container.style.transform = "translate(-50%, -50%)";

  // Возвращаем контейнер для дальнейшей настройки или удаления
  return container;
}