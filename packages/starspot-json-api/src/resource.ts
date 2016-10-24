import { Model, Reflector } from "starspot-core";
import JSONAPI from "./json-api";
import Inflected = require("inflected");

/**
 * A Resource tells Starspot how to map models from your ORM into a JSON
 * response, and how to map incoming HTTP requests into changes to the
 * underlying database.
 *
 * Resources serve two purposes:
 *
 * * Static methods on the class tell Starspot how to find models in the
 *   database.
 * * Instances of Resource wrap an underlying model object and control how it
 *   is serialized to JSON and vice versa.
 *
 * For example, to find all instances of the Photo model, Starspot will call the
 * PhotoResource's static findAll() method, which should delegate that requests
 * to the database and return an array of model objects.
 *
 * Each of those returned models will be wrapped in a `PhotoResource` instance.
 * That instance will control how the underlying model is converted into JSON
 * used to respond to the request.
 */
class Resource<T extends Model> {
  model: T;

  static "@@fields": Descriptors;
  "@@fields": Descriptors;
  _attributesList: string[];
  _relationshipsList: string[];

  // TypeScript can't infer constructor property for some reason.
  ["constructor"]: typeof Resource;
  constructor(model?: T) {
    let fields = this["@@fields"] = merge({}, this["@@fields"], this.constructor["@@fields"]);
    let relationships: string[] = [];
    let attributes: string[] = [];

    let fieldKeys = Object.keys(fields);
    for (let i = 0; i < fieldKeys.length; i++) {
      let key = fieldKeys[i];
      if (fields[key] instanceof AttributeDescriptor) {
        attributes.push(key);
      } else {
        relationships.push(key);
      }
    }

    this._attributesList = attributes;
    this._relationshipsList = relationships;

    this.model = model;
  }

  async validate(): Promise<boolean> {
    let model = this.model;

    if (typeof model.validate === "function") {
      return model.validate();
    } else {
      return Reflector.get(model).validate(model);
    }
  }

  async updateAttributes?(attributes: Resource.Attributes): Promise<void>;
  async findByID?(id: JSONAPI.ID): Promise<Model>;

  static async findAll?(): Promise<Model[]>;
  static async create?(options: Resource.CreateOptions): Promise<Model>;
}

function merge(target: any, ...sources: any[]) {
  for (let i = 0; i < sources.length; i++) {
    let source = sources[i];
    for (let key in source) {
      target[key] = source[key];
    }
  }

  return target;
}

class ResourceReflector implements Reflector {
  getType(resource: Resource<any>) {
    let model = resource.model;
    let type = Reflector.get(model).getType(model);

    return Inflected.pluralize(type);
  }

  getID(resource: Resource<any>) {
    let model = resource.model;
    return Reflector.get(model).getID(model);
  }

  getAttributes(resource: Resource<any>) {
    return resource._attributesList;
  }

  getAttribute(resource: Resource<any>, attribute: string) {
    let model = resource.model;
    return Reflector.get(model).getAttribute(model, attribute);
  }

  getRelationships(resource: Resource<any>) {
    return resource._relationshipsList;
  }

  getRelationship(resource: Resource<any>, relationship: string) {
    let model = resource.model;
    return Reflector.get(model).getRelationship(model, relationship);
  }
}

Reflector.install(Resource, new ResourceReflector());

export default Resource;

namespace Resource {
  export interface CreateOptions {
    attributes: JSONAPI.AttributesObject;
  }

  export interface Attributes {
    [attr: string]: any;
  }
}

export class Descriptor {
  constructor(public name: string) {
  }

  updatable = false;
  creatable = false;

  get writable() {
    return this.updatable && this.creatable;
  }

  set writable(writable: boolean) {
    this.updatable = writable;
    this.creatable = writable;
  }

  clone(): Descriptor {
    let desc = new (<any>this.constructor)(this.name);
    desc.updatable = this.updatable;
    desc.creatable = this.creatable;
    return desc;
  }
}

export class AttributeDescriptor extends Descriptor {
}

export type RelationshipType = "hasOne" | "hasMany";

export class RelationshipDescriptor extends Descriptor {
  type: RelationshipType;
}

export interface Descriptors {
  [attr: string]: Descriptor
}

interface HasFields {
  "@@fields": Descriptors
}

/*
 * Property Decorators
 */
export function attribute(resource: Resource<any>, attribute: string) {
  descriptorFor(resource, attribute, AttributeDescriptor);
}

export function writable(resource: Resource<any>, attribute: string) {
  descriptorFor(resource, attribute, AttributeDescriptor).writable = true;
}

export function updatable(resource: Resource<any>, attribute: string) {
  descriptorFor(resource, attribute, AttributeDescriptor).updatable = true;
}

export function creatable(resource: Resource<any>, attribute: string) {
  descriptorFor(resource, attribute, AttributeDescriptor).creatable = true;
}

export function readOnly(resource: Resource<any>, attribute: string) {
  descriptorFor(resource, attribute, AttributeDescriptor).writable = false;
}

/*
 * Class Decorators
 */
export function attributes(...attributes: string[]) {
  return createAttributes(attributes);
}

export function writableAttributes(...attributes: string[]) {
  return createAttributes(attributes, "writable");
}

export function updatableAttributes(...attributes: string[]) {
  return createAttributes(attributes, "updatable");
}

export function creatableAttributes(...attributes: string[]) {
  return createAttributes(attributes, "creatable");
}

function createAttributes(attributes: string[], flag?: string) {
  return function(resourceConstructor: typeof Resource) {
    for (let i = 0; i < attributes.length; i++) {
      let desc = descriptorFor(resourceConstructor, attributes[i], AttributeDescriptor);
      if (flag) { desc[flag] = true; }
    }
  };
}

export function hasOne(relationship: string) {
  return function(resourceConstructor: typeof Resource) {
    let desc = descriptorFor(resourceConstructor, relationship, RelationshipDescriptor);
    desc.type = "hasOne";
  };
}

const hasOwnProperty = Object.prototype.hasOwnProperty;

/**
 * Retrieves the attribute descriptor for the named attribute, creating a new
 * descriptor if none already exists.
 */
function descriptorFor<T extends Descriptor>(proto: HasFields, name: string, DescriptorClass: { new(...args: any[]): T }): T {
  let fields = fieldsFor(proto);
  let desc = fields[name];

  if (!desc) {
    desc = fields[name] = new DescriptorClass(name);
  } else if (!hasOwnProperty.call(fields, name)) {
    desc = fields[name] = desc.clone();
  }

  return desc as T;
}

function fieldsFor(proto: HasFields) {
  let fields = proto["@@fields"];

  if (!fields || !proto.hasOwnProperty("@@fields")) {
    fields = proto["@@fields"] = Object.create(fields || null);
  }

  return fields;
}