import Addon from "../../../../../src/addon";
import Command from "../../../../../src/command";

export class MyCommand extends Command {
  public static command = "my-command";
  public static aliases = ["mc", "mycommand"];

  async run(): Promise<void> {
  }
}

export default class MyAddon extends Addon {
  commands = [MyCommand];
}