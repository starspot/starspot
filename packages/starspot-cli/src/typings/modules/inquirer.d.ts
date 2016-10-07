import { Questions, Answers } from "inquirer";

declare module "inquirer" {
  export interface Inquirer {
    prompt(questions: Questions[]): PromiseLike<Answers>;
  }
}