export default class TableManager {
  /**
   * Создает HTML-элемент таблицы с заданными заголовками и данными
   * @param titles массив заголовков столбцов
   * @param rows массив строк с данными
   * @returns HTML-элемент таблицы
   */
  static makeTable(titles: string[], rows: string[][]): HTMLElement {
    const table = document.createElement("table");
    table.style.borderCollapse = "collapse";
    table.style.width = "100%";

    // Создаем заголовок таблицы
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");

    titles.forEach((title) => {
      const th = document.createElement("th");
      th.textContent = title;
      th.style.borderBottom = "1px solid";
      th.style.padding = "6px";
      headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Создаем тело таблицы
    const tbody = document.createElement("tbody");

    rows.forEach((row) => {
      const tr = document.createElement("tr");

      row.forEach((cell) => {
        const td = document.createElement("td");
        td.textContent = cell;
        td.style.borderBottom = "1px solid";
        td.style.padding = "6px";
        tr.appendChild(td);
      });

      tbody.appendChild(tr);
    });

    table.appendChild(tbody);

    return table;
  }
}
