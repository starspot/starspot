import { Application } from "starspot-core";
import { CommandConstructor } from "./command";

export default class Addon {
  public name: string;
  public commands: CommandConstructor[];
  public initializers: Application.Initializer[];
}