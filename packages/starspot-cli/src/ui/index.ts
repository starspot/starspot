import { UI as BaseUI } from "starspot";
import { inspect } from "util";
import * as chalk from "chalk";
import * as inquirer from "inquirer";
import * as wrap from "wordwrap";

import "./ext/inquirer";

import getWindowSize from "../utils/window-size";
import formatters from "./formatters";

const COLORS: { [index: string]: [Function, Function]} = {
  info: [chalk.bgCyan.white, chalk.cyan],
  warn: [chalk.bgYellow.white, chalk.yellow],
  prompt: [chalk.bgCyan.white, chalk.cyan],
  error: [chalk.bgRed.white, chalk.red]
};

class UI extends BaseUI {
  private lastCategory: UI.Category = null;

  askOne(event: UI.Event) {
    event.category = event.category || "prompt";

    let prelude: any;

    if (prelude = formatters["prompt"][`${event.name}-prelude`]) {
      let name = event.name;
      event.name = `${name}-prelude`;
      this._log(event);
      event.name = name;
    }

    let questions: inquirer.Question[] = [{
      type: "confirm",
      message: formatters["prompt"][event.name](event),
      name: "askOne"
    }];

    return inquirer.prompt(questions)
      .then((answers: inquirer.Answers) => {
        return answers["askOne"];
      });
  }

  _log(event: UI.Event) {
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

    if (!message) { return; }

    let formattedCategory = printCategory ? categoryColor(` ${category.toUpperCase()} `) : "";
    message = pad(message, category.length + 3, printCategory);

    console.log(formattedCategory + color(message));
  }
}

function pad(str: string, categoryLength: number, printCategory: boolean): string {
  let { width } = getWindowSize();
  width -= categoryLength;

  let center = wrap(Math.max(width || 100));
  let centered = center(str);

  centered = centered.split("\n")
    .map(c => " ".repeat(categoryLength) + c)
    .join("\n");

  return printCategory ? " " + trimLeft(centered) : centered;
}

function trimLeft(message: string): string {
  return message.replace(/^\s+/, "");
}

namespace UI {
  export type Category = BaseUI.Category;
  export type Event = BaseUI.Event;
}

export default UI;