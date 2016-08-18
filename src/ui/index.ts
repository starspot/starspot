import { inspect } from "util";
import * as chalk from "chalk";

import formatters from "./formatters";

export type Category = "info" | "warn" | "error";

const COLORS: { [index: string]: [Function, Function]} = {
  info: [chalk.bgCyan.white, chalk.cyan],
  prompt: [chalk.bgCyan.white, chalk.cyan],
  error: [chalk.bgRed.white, chalk.red]
};

export default class UI {
  private logLevel = LogLevel.Info;
  private lastCategory: Category = null;

  info(event: Event) {
    if (this.logLevel > LogLevel.Info) { return; }

    event.category = "info";
    this._log(event);
  }

  warn(event: Event) {
    if (this.logLevel > LogLevel.Warn) { return; }

    event.category = "warn";
    this._log(event);
  }

  error(event: Event) {
    if (this.logLevel > LogLevel.Error) { return; }

    event.category = "error";
    this._log(event);
  }

  _log(event: Event) {
    let { category } = event;
    let [categoryColor, color] = COLORS[category];
    let formatter = formatters[category] && formatters[category][event.name];
    let message: string;

    let printCategory = false;

    if (category !== this.lastCategory) {
      console.log();
      printCategory = true;
    }

    this.lastCategory = category;

    if (formatter) {
      message = formatter(event);
    } else {
      message = inspect(event);
    }

    let formattedCategory = printCategory ? categoryColor(` ${category.toUpperCase()} `) : " ".repeat(category.length + 2);
    console.log(formattedCategory, color(message));
  }
}

export enum LogLevel {
  VeryVerbose,
  Verbose,
  Info,
  Warn,
  Error
}

export interface Event {
  name: string;
  category?: Category;
  logLevel?: LogLevel;
  [key: string]: any;
};