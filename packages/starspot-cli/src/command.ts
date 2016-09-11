import { Environment } from "starspot";
import Project from "./project";
import UI from "./ui";

export interface Alias {
  [key: string]: string;
}

export interface CommandOptions {
  name: string;
  type: any;
  aliases?: (string | Alias)[];
  description?: string;
}

export interface ConstructorOptions {
  ui: UI;
  project?: Project;
  env?: Environment;
}

abstract class Command {
  public static command: string;
  public static aliases: string[];
  public static availableOptions: CommandOptions[];
  protected project: Project;
  protected ui: UI;
  protected env: Environment;

  constructor(options: ConstructorOptions) {
    this.ui = options.ui;
    this.project = options.project;
    this.env = options.env;
  }

  abstract async run(options: Command.RunOptions): Promise<any>;
}

export default Command;

namespace Command {
  export interface RunOptions {
    args: string[];
  }
}

export interface CommandConstructor {
  new <T extends Command>(options: ConstructorOptions): T;
  command: string;
  aliases?: string[];
}
