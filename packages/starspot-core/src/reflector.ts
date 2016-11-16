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
    valueFunc: Function;

    get value() {
      return Promise.resolve(this.valueFunc());
    }

    constructor(type: string, id: string, valueFunc: Function) {
      super();
      this.type = type;
      this.id = id != null ? id : null;
      this.valueFunc = valueFunc;
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

export type StaticReflectorOptions = {
  type: string;
  attributes: string[];
  idAttribute?: string;
};

export class StaticReflector implements Reflector {
  protected type: string;
  protected attributes: string[];
  protected idAttribute: string;

  constructor(options: StaticReflectorOptions) {
    this.type = options.type;
    this.attributes = options.attributes;
    this.idAttribute = options.idAttribute || "id";
  }

  getType() {
    return this.type;
  }

  getID(model: any) {
    return model[this.idAttribute] as string;
  }

  getAttributes() {
    return this.attributes;
  }

  getAttribute(model: any, attribute: string) {
    return model[attribute];
  }

  getRelationships(_model: any): string[] {
    return [];
  }

  getRelationship(_model: any, _attribute: string): Reflector.Relationship {
    return null;
  }

  async validate?(_model: any) {
    return true;
  }
}
