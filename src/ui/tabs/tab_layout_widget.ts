export interface TabData {
  // Заголовок вкладки
  title: string;
  // Содержимое, отображаемое при выборе вкладки (может быть HTML-строкой или обычным текстом)
  content: (data: TabData) => HTMLElement;
}

export class TabsLayoutWidget {
  private container: HTMLElement;
  private tabs: TabData[];
  private activeTabIndex: number = 0;
  private buttonsContainer: HTMLElement;
  private contentContainer: HTMLElement;

  /**
   * Создаёт виджет вкладок.
   * @param container HTMLElement, в котором будет строиться виджет.
   * @param tabs Массив объектов TabData, содержащих заголовки и содержимое для вкладок.
   */
  constructor(container: HTMLElement, tabs: TabData[]) {
    this.container = container;
    this.tabs = tabs;
    this.init();
  }

  /**
   * Инициализирует виджет, создаёт базовую структуру.
   */
  private init(): void {
    // Очищаем контейнер
    this.container.innerHTML = "";

    // Создаём контейнер для кнопок вкладок
    this.buttonsContainer = document.createElement("div");
    this.buttonsContainer.className = "tab-buttons";
    this.buttonsContainer.style.marginBottom = "8px";
    this.container.appendChild(this.buttonsContainer);

    // Создаём контейнер для отображения содержимого вкладки
    this.contentContainer = document.createElement("div");
    this.contentContainer.className = "tab-content";
    this.container.appendChild(this.contentContainer);

    // Отрисовываем кнопки и начальное содержимое
    this.renderButtons();
    this.renderContent();
  }

  /**
   * Отрисовывает кнопки вкладок в buttonsContainer.
   */
  private renderButtons(): void {
    // Очищаем контейнер кнопок перед обновлением
    this.buttonsContainer.innerHTML = "";
    this.tabs.forEach((tab, index) => {
      const button = document.createElement("button");
      button.textContent = tab.title;
      button.className = index === this.activeTabIndex ? "active" : "";
      button.style.marginBottom = "8px";
      if (index < this.tabs.length - 1) {
        button.style.marginRight = "8px";
      }
      if (index == this.activeTabIndex) {
        button.style.textDecoration = "underline";
      }
      button.addEventListener("click", () => this.onTabClick(index));
      this.buttonsContainer.appendChild(button);
    });
  }

  /**
   * Отрисовывает содержимое активной вкладки в contentContainer.
   */
  private renderContent(): void {
    // Очищаем содержимое контейнера
    this.contentContainer.innerHTML = "";
    this.contentContainer.appendChild(
      this.tabs[this.activeTabIndex].content(this.tabs[this.activeTabIndex]),
    );
  }

  /**
   * Обработчик клика по кнопке вкладки.
   * @param index Индекс выбранной вкладки.
   */
  private onTabClick(index: number): void {
    if (this.activeTabIndex == index) {
      return;
    }

    this.activeTabIndex = index;
    this.renderButtons();
    this.renderContent();
  }
}