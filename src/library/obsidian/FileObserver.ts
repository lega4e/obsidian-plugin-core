import { App, TFile } from "obsidian";

export default class FileObserver {
  constructor(
    private app: () => App,
    private observers: {
      filename: () => string;
      onModify: (file: TFile) => void;
    }[]
  ) {}

  init() {
    this.app().vault.on("modify", (file) => {
      if (!(file instanceof TFile)) {
        console.error("FileObserver: file is not a TFile", file);
        return;
      }

      for (const { filename, onModify } of this.observers) {
        if (file.path === filename()) {
          try {
            onModify(file);
          } catch (error) {
            console.error("FileObserver: error in onModify", error);
          }
        }
      }
    });
  }
}
