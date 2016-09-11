import { Environment } from "starspot";
import UI from "./ui";
import Project from "./project";
import Command, { CommandConstructor } from "./command";
import HandledError from "./errors/handled-error";

export interface CLIOptions {
  /** Stream to read input from. Defaults to stdin. */
  inputStream?: NodeJS.ReadableStream;
  /** Stream to write output to. Defaults to stdout. */
  outputStream?: NodeJS.WritableStream;
  /** Stream to write error output to. Defaults to stderr. */
  errorStream?: NodeJS.WritableStream;
  /** Command line arguments. */
  argv?: string[];
  project?: Project;
  env?: Environment;
}

export default class CLI {
  private argv: string[];
  private ui: UI;
  private project: Project;
  private env: Environment;

  constructor(options: CLIOptions = {}) {
    this.ui = new UI({
      inputStream: options.inputStream,
      outputStream: options.outputStream,
      errorStream: options.errorStream
    });

    this.argv = options.argv || process.argv.slice(2);
    this.env = options.env || new Environment();
    this.project = options.project || new Project({
      ui: this.ui
    });

    if (this.project.isTypeScript && !this.env.isProduction) {
      require("ts-node/register");
    }
  }

  async run(): Promise<any> {
    let commandName = this.argv.shift() || "server";
    let commandArgs = this.argv;

    // This is a performance optimization, because in-app addons can be written
    // in TypeScript and thus this may be the first code path that triggers
    // instantiating the TypeScript compiler. If compiling in-app addons to
    // discover commands, it can add several hundred milliseconds to start time
    // before the user sees any feedback. Instead, we search built-in commands
    // first, because they will have been precompiled to JavaScript. Only if the
    // command was not found do we load addons and search their commands.
    let command = this.findCommand(this.project.builtInCommands, commandName);

    if (!command) {
      command = this.findCommand(this.project.addonCommands, commandName);
    }

    if (command) {
      try {
        return command.run({
          args: commandArgs
        });
      } catch (e) {
        if (!(e instanceof HandledError)) {
          this.ui.error(e);
        }
      }
    } else {
      this.ui.error({
        name: "no-such-command",
        command: commandName
      });
    }
  }

  private findCommand(commands: CommandConstructor[], commandName: string): Command {
    let CurrentCommand = commands.find(candidate => {
      return candidate.command === commandName ||
        (candidate.aliases && candidate.aliases.indexOf(commandName) > -1);
    });

    if (!CurrentCommand) { return null; }

    this.ui.verbose({
      name: "cli-invoking-command",
      command: CurrentCommand.command
    });

    return new CurrentCommand({
      ui: this.ui,
      project: this.project,
      env: this.env
    });
  }
}