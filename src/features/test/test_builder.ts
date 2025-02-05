import { DvApi } from "src/domain/interfaces/dv_api";
import {
  AutocompleteOption,
  createDropdownWidget,
} from "src/ui/input/AutocompleteInput";
import { AutocompleteInput } from "src/ui/input/AutocompleteInput";

export class TestBuilder {
  private dv: DvApi;

  constructor(dv: DvApi) {
    this.dv = dv;
  }

  buildTest1() {
    const div = createDropdownWidget(["Яблоко", "Банан", "Вишня", "Дуриан"]);

    // const container = document.createElement("div");
    // container.id = "autocomplete-container";
    // container.style.marginTop = "10px";
    // container.style.marginLeft = "3px";
    // container.style.marginBottom = "10px";

    // // Определяем варианты автодополнения
    // const options: AutocompleteOption[] = [
    //   { label: "Яблоко", value: "apple" },
    //   { label: "Банан", value: "banana" },
    //   { label: "Вишня", value: "cherry" },
    //   { label: "Дуриан", value: "durian" },
    // ];

    // // Создаём экземпляр виджета автодополнения
    // new AutocompleteInput({
    //   container,
    //   options,
    //   callback: (option) => {
    //     console.log("Выбранный вариант:", option);
    //   },
    // });

    this.dv.el("div", div);
  }
}