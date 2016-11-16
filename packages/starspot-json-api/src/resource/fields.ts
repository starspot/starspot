import { descriptorsFor, setMetadataFor, DescriptorMap, Descriptor } from "starspot-metadata";

const FIELDS = Symbol("staspot:json-api:fields");

/**
 * Retrieves the Field descriptor for the named attribute, creating a new
 * descriptor if none already exists.
 */
export function fieldFor<T extends Field>(target: any, key: string, FieldClass: { new(...args: any[]): T }): T {
  let fields = fieldsFor(target);
  let field = fields.get(key);

  if (!field) {
    field = new FieldClass(key);
    fields.set(key, field);
  }

  return field as T;
}

export function fieldsFor(target: any): Fields {
  return descriptorsFor<string, Field>(target, FIELDS, true);
}

export function setFieldsFor(target: any, fields: Fields) {
  setMetadataFor(target, FIELDS, fields);
}

export function mergeFields(target: any, targetConstructor: any): [Fields, string[], string[]] {
  let relationships: string[] = [];
  let attributes: string[] = [];

  let fields: Fields = mergeMaps(fieldsFor(target), fieldsFor(targetConstructor));

  for (let [field, desc] of fields.entries()) {
    if (desc instanceof AttributeField) {
      attributes.push(field as string);
    } else {
      relationships.push(field as string);
    }
  }

  return [fields, attributes, relationships];
}

function mergeMaps(...sources: Map<any, any>[]) {
  let target = new DescriptorMap<string, Field>();

  for (let i = 0; i < sources.length; i++) {
    let source = sources[i];
    if (!source) { continue; }

    for (let [key, value] of source.entries()) {
      target.set(key, value);
    }
  }

  return target;
}

export type Fields = DescriptorMap<string, Field>

export class Field implements Descriptor {
  constructor(public name: string) {
  }

  updatable = false;
  creatable = false;
  ignoreUpdateErrors = false;

  get writable() {
    return this.updatable && this.creatable;
  }

  set writable(writable: boolean) {
    this.updatable = writable;
    this.creatable = writable;
  }

  clone(): this {
    let desc = new (<any>this.constructor)(this.name);
    desc.updatable = this.updatable;
    desc.creatable = this.creatable;
    desc.ignoreUpdateErrors = this.ignoreUpdateErrors;

    return desc;
  }
}

export class AttributeField extends Field {
}

export type RelationshipType = "hasOne" | "hasMany";

export class RelationshipField extends Field {
  type: RelationshipType;
}
