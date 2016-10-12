/**
 * A Reflector allows Starspot to retrieve information about a model. For
 * example, to serialize a model to JSON, Starspot needs to be able to ask it
 * for a list of its attributes.
 *
 * Reflectors allow Starspot to be ORM-agnostic. Instead of hardcoding Starspot
 * to a particular ORM, anyone can write a reflector and install it on models of
 * their ORM of choice (or even use reflectors on objects that come from an
 * ORM).
 */

interface Reflector {
  getType(model: any): string;
  getID(model: any): string;
  getAttributes(model: any): string[];
  getAttribute(model: any, attribute: string): any;
  validate(model: any): Promise<boolean>;
}

namespace Reflector {
  export let SYMBOL: "@@StarspotReflector" = "@@StarspotReflector";

  export function install(klass: Factory, reflector: Reflector) {
    (klass.prototype as any)[SYMBOL] = reflector;
  }

  export function get(model: any) {
    return model[SYMBOL] as Reflector;
  }
}

export default Reflector;

export interface Factory {
  prototype: {};
}