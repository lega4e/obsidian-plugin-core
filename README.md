# Документация плагина

Этот плагин содержит несколько основных модулей, каждый из которых реализует свою функциональность. Ниже описаны функции основных классов: CategoriesPrinter, ParamsPrinter и ChartManager.

## DiaryPagesManager

Класс `DiaryPagesManager` отвечает за управление страницами дневника. Его функционал включает:
- **Получение границ периода:** Методы `weekEdges`, `monthEdges`, `monthWeekEdges` вычисляют границы недели или месяца на основе имени файла.
- **Получение списка страниц:** Методы `weekPages`, `monthPages`, `yearPages`, `monthsPages` и `weeksByMonthPages` возвращают отсортированные списки страниц дневника, удовлетворяющие заданным критериям.
- **Формирование названий страниц:** Методы `nextDayPageName`, `prevDayPageName`, `weekPageName`, `monthPageName`, `yearPageName`, `nextWeekPageName`, `prevWeekPageName`, `nextMonthPageName`, `prevMonthPageName`, `nextYearPageName`, `prevYearPageName` генерируют имена для страниц следующего/предыдущего периода.

Эта функциональность позволяет пользователю динамически управлять данными дневника, получать периоды и автоматизировать навигацию между страницами.

## CategoriesPrinter

Класс `CategoriesPrinter` отвечает за:
- **Загрузку данных категорий:** Метод `loadPages` принимает список страниц и типы паков, а также настраивает информацию для построения таблицы и диаграммы.
- **Построение таблицы:** Метод `buildTable` формирует таблицу с названиями категорий и временем, используя API (в частности, метод `table` объекта `DvApi`).
- **Вывод итоговой информации:** В зависимости от загруженных данных, после таблицы выводится суммарная информация (например, итоговое время) с учётом различных условий.
- **Построение диаграммы:** Метод `buildChart` использует данные для построения круговой диаграммы (pie chart) через класс `ChartManager`.

## ParamsPrinter

Класс `ParamsPrinter` предназначен для работы с параметрами, определёнными в YAML-файле, и включает следующие функции:
- **Загрузка параметров:** Метод `loadParams` принимает список страниц (а также опционально предыдущие и следующие страницы) и вычисляет среднее значение для каждого параметра. Для расчёта среднего используется экземпляр класса `ParamsManager`.
- **Очистка параметров:** Метод `clearParams` сбрасывает ранее загруженные параметры.
- **Построение таблицы:** Метод `buildTable` генерирует таблицу с заголовками `Название`, `Среднее значение` и, если доступны, колонками с предыдущими и следующими значениями. В таблице:
  - В первой колонке отображается название параметра.
  - Во второй колонке — среднее значение (значение берётся из массива `value[0]`).
  - Если заданы дополнительные данные (предыдущие/следующие), они также выводятся в отдельных столбцах.

## ChartManager

Класс `ChartManager` (находится в модуле charts) отвечает за построение графиков, в частности:
- **Построение диаграмм:** Он предоставляет методы для создания диаграмм (например, круговых диаграмм). Данные, передаваемые в `ChartManager`, позволяют построить визуальное представление распределения по категориям.
- **Настройка отображения:** Через объект настроек можно задать параметры диаграммы (цвета, метки, подсказки (tooltips)), что позволяет адаптировать график под нужды пользователя.

## Заключение

Плагин объединяет функциональность по анализу категорий, параметров и построению диаграмм. Используя классы `CategoriesPrinter`, `ParamsPrinter` и `ChartManager`, пользователь получает инструменты для:
- Визуальной проверки работы категорий (таблицы с категориями и диаграммы).
- Анализа параметров (вычисление средних значений и формирование соответствующих таблиц).
- Построения наглядной диаграммы с возможностью тонкой настройки отображения данных.

Эта документация предназначена для разработчиков, желающих понять и расширить функциональность плагина.