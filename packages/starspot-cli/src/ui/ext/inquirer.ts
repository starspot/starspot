import * as inquirer from "inquirer";
import { cyan, dim } from "chalk";

let Confirm = (inquirer as any)["prompt"]["prompts"]["confirm"];

Confirm.prototype.getQuestion = function () {
  let message = " " + cyan(this.opt.message) + " ";

  // Append the default if available, and if question isn't answered
  if (this.opt.default != null && this.status !== "answered") {
    message += dim("(" + this.opt.default + ") ");
  }

  return message;
};