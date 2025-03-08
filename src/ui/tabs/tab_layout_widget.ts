export interface TabData {
  // Заголовок вкладки
  title: string;
  // Содержимое, отображаемое при выборе вкладки (может быть HTML-строкой или обычным текстом)
  content: (data: TabData) => HTMLElement;
  setAttrsToTabContent?: (tabContent: HTMLElement) => void;
}

export class TabsLayoutWidget {
  public container: HTMLElement; private tabs: TabData[];
  private activeTabIndex: number = 0;
  private buttonsContainer: HTMLElement;
  private contentContainer: HTMLElement;

  /**
   * Создаёт виджет вкладок.
   * @param container HTMLElement, в котором будет строиться виджет.
   * @param tabs Массив объектов TabData, содержащих заголовки и содержимое для вкладок.
   */
  constructor(container?: HTMLElement, tabs: TabData[] = []) {
    if (container) {
      this.container = container;
    } else {
      this.container = document.createElement("div");
      this.container.className = "tabs-layout-widget-container";
      this.container.style.marginTop = "8px";
    }
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
    // Очищаем содержимое контейнера и его атрибуты
    while (this.contentContainer.attributes.length > 0) {
      this.contentContainer.removeAttribute(this.contentContainer.attributes[0].name);
    }
    this.contentContainer.innerHTML = "";
    this.contentContainer.className = "tab-content";

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
