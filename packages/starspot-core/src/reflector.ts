/**
 * A Reflector allows Starspot to retrieve information about a model. For
 * example, to serialize a model to JSON, Starspot needs to be able to ask it
 * for a list of its attributes.
 *
 * Reflectors allow Starspot to be ORM-agnostic. Instead of hardcoding Starspot
 * to a particular ORM, anyone can write a reflector and install it on models of
 * their ORM of choice (or even use reflectors on objects that don't come from
 * an ORM).
 */

interface Reflector {
  getType(model: any): string;
  getID(model: any): string;
  getAttributes(model: any): string[];
  getAttribute(model: any, attribute: string): any;
  getRelationships(model: any): string[];
  getRelationship(model: any, attribute: string): Reflector.Relationship;
  validate?(model: any): Promise<boolean>;
}

namespace Reflector {
  export let SYMBOL: "@@StarspotReflector" = "@@StarspotReflector";

  export function install(klass: Factory, reflector: Reflector) {
    (klass.prototype as any)[SYMBOL] = reflector;
  }

  export function get(model: any) {
    return model[SYMBOL] as Reflector;
  }

  export type RelationshipType = "hasOne" | "hasMany";

  export class Relationship {
    relationshipType: RelationshipType;
    type: string;
  }

  export class HasOneRelationship extends Relationship {
    relationshipType: RelationshipType = "hasOne";
    id: string;

    constructor(type: string, id: string) {
      super();
      this.type = type;
      this.id = id;
    }
  }

  export class HasManyRelationship extends Relationship {
    relationshipType: RelationshipType = "hasMany";
  }
}

export default Reflector;

export interface Reflectable {
  "@@StarspotReflector": Reflector;
}

export interface Factory {
  prototype: {};
}
