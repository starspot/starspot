import { Reflectable } from "./reflector";

/**
 * An Inquirer allows Starspot to to query for one or more models.
 *
 * Inquirers allow Starspot to be ORM-agnostic. Instead of hardcoding Starspot
 * to a particular ORM, anyone can write an inquirer and install it on model
 * classes of their ORM of choice (or even use inquirers on objects that don't
 * come from an ORM).
 */

interface Inquirer {
  all(): Promise<Reflectable[]>;
}

namespace Inquirer {
  export let SYMBOL: "@@StarspotInquirer" = "@@StarspotInquirer";

  export function install(klass: Factory, inquirer: Inquirer) {
    (klass as any)[SYMBOL] = inquirer;
  }

  export function get(model: any) {
    return model[SYMBOL] as Inquirer;
  }
}

export default Inquirer;

export interface Factory {
  prototype: {};
}