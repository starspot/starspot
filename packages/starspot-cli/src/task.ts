import { Environment } from "starspot";
import UI from "./ui";
import Project from "./project";
import HandledError from "./errors/handled-error";

export interface ConstructorOptions {
  ui: UI;
  project: Project;
  env: Environment;
}

abstract class Task {
  protected ui: UI;
  protected project: Project;
  protected env: Environment;

  constructor(options: ConstructorOptions) {
    this.ui = options.ui;
    this.env = options.env;
    this.project = options.project;
  }

  protected abstract run<U>(): Promise<U>;

  public invoke<U>(): Promise<U> {
    return this.run<U>()
      .catch(e => {
        this.ui.error(e);
        throw new HandledError(e);
      });
  }
}

export default Task;