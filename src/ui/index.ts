import { inspect } from "util";
import * as chalk from "chalk";

export type Category = "info" | "warn" | "error";

const COLORS: { [index: string]: [Function, Function]} = {
  info: [chalk.bgCyan.white, chalk.cyan],
  prompt: [chalk.bgCyan.white, chalk.cyan],
  error: [chalk.bgRed.white, chalk.red]
};

class UI {
  private logLevel = UI.LogLevel.Info;
  private lastCategory: Category = null;

  constructor(options: ConstructorOptions = {}) {
    this.logLevel = options.logLevel || this.logLevel;
  }

  info(event: Event) {
    if (this.logLevel > UI.LogLevel.Info) { return; }

    event.category = "info";
    this._log(event);
  }

  warn(event: Event) {
    if (this.logLevel > UI.LogLevel.Warn) { return; }

    event.category = "warn";
    this._log(event);
  }

  error(event: Event) {
    if (this.logLevel > UI.LogLevel.Error) { return; }

    event.category = "error";
    this._log(event);
  }

  _log(event: Event) {
    let { category } = event;
    let [categoryColor, color] = COLORS[category];
    let message: string;

    let printCategory = false;

    if (category !== this.lastCategory) {
      console.log();
      printCategory = true;
    }

    this.lastCategory = category;

    message = inspect(event);

    let formattedCategory = printCategory ? categoryColor(` ${category.toUpperCase()} `) : " ".repeat(category.length + 2);
    console.log(formattedCategory, color(message));
  }
}

namespace UI {
  export enum LogLevel {
    VeryVerbose,
    Verbose,
    Info,
    Warn,
    Error
  }
}

export default UI;

export interface ConstructorOptions {
  logLevel?: UI.LogLevel;
}

export interface Event {
  name: string;
  category?: Category;
  logLevel?: UI.LogLevel;
  [key: string]: any;
};