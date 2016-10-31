import Inflected = require("inflected");
import { Model, Reflector } from "starspot-core";

import JSONAPI from "./json-api";
import { setFieldsFor, mergeFields } from "./resource/fields";

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

  _attributesList: string[];
  _relationshipsList: string[];

  // TypeScript can't infer constructor property for some reason.
  ["constructor"]: typeof Resource;
  constructor(model?: T) {
    let [fields, attributes, relationships] = mergeFields(this.constructor.prototype, this.constructor);
    setFieldsFor(this, fields);

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
  async save?(): Promise<Model>;

  static async create?(options: Resource.CreateOptions): Promise<Model>;
  static async findByID?(id: JSONAPI.ID): Promise<Model>;
  static async findAll?(): Promise<Model[]>;
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

export * from "./resource/decorators";