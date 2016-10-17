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

  static _attributes: AttributeDescriptors;
  _attributes: AttributeDescriptors;
  _attributesList: string[];

  // TypeScript can't infer constructor property for some reason.
  ["constructor"]: typeof Resource;
  constructor(model?: T) {
    this._attributes = merge({}, this._attributes, this.constructor._attributes);
    this._attributesList = Object.keys(this._attributes);

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

  static async findAll?(): Promise<any[]>;
  static async create?(options: Resource.CreateOptions): Promise<any>;
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
}

Reflector.install(Resource, new ResourceReflector());

export default Resource;

namespace Resource {
  export interface CreateOptions {
    attributes: JSONAPI.AttributesObject;
  }
}

export class AttributeDescriptor {
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

  clone() {
    let desc = new AttributeDescriptor(this.name);
    desc.updatable = this.updatable;
    desc.creatable = this.creatable;
    return desc;
  }
}

export interface AttributeDescriptors {
  [attr: string]: AttributeDescriptor
}

interface Attributable {
  _attributes: AttributeDescriptors
}

/*
 * Property Decorators
 */
export function attribute(resource: Resource<any>, attribute: string) {
  descriptorFor(resource, attribute);
}

export function writable(resource: Resource<any>, attribute: string) {
  descriptorFor(resource, attribute).writable = true;
}

export function readOnly(resource: Resource<any>, attribute: string) {
  descriptorFor(resource, attribute).writable = false;
}

/*
 * Class Decorators
 */
export function attributes(...attributes: string[]) {
  return function(resourceConstructor: typeof Resource) {
    for (let i = 0; i < attributes.length; i++) {
      descriptorFor(resourceConstructor, attributes[i]);
    }
  };
}

export function writableAttributes(...attributes: string[]) {
  return function(resourceConstructor: typeof Resource) {
    for (let i = 0; i < attributes.length; i++) {
      descriptorFor(resourceConstructor, attributes[i]).writable = true;
    }
  };
}

const hasOwnProperty = Object.prototype.hasOwnProperty;
/**
 * Retrieves the attribute descriptor for the named attribute, creating a new
 * descriptor if none already exists.
 */
function descriptorFor(proto: Attributable, name: string) {
  let attributes = attributesFor(proto);

  let desc = attributes[name];

  if (!desc) {
    desc = attributes[name] = new AttributeDescriptor(name);
  } else if (!hasOwnProperty.call(attributes, name)) {
    desc = attributes[name] = desc.clone();
  }

  return desc;
}

function attributesFor(proto: Attributable) {
  let attributes = proto._attributes;

  if (!attributes || !proto.hasOwnProperty("_attributes")) {
    attributes = proto._attributes = Object.create(attributes || null);
  }

  return attributes;
}