import Reflector from "./reflector";

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
class Resource {
  static whitelistedAttributes: string[] = [];

  model: any;
  constructor(model?: any) {
    this.model = model;
  }

  static findAll?(): any[];
}

class ResourceReflector implements Reflector {
  getType(resource: Resource) {
    let model = resource.model;
    return Reflector.get(model).getType(model);
  }

  getID(resource: Resource) {
    let model = resource.model;
    return Reflector.get(model).getID(model);
  }

  getAttributes(resource: Resource) {
    return (resource.constructor as typeof Resource).whitelistedAttributes;
  }

  getAttribute(resource: Resource, attribute: string) {
    let model = resource.model;
    return Reflector.get(model).getAttribute(model, attribute);
  }
}

Reflector.install(Resource, new ResourceReflector());

export default Resource;

export function attribute(attribute: string) {
  return function(constructor: typeof Resource) {
    constructor.whitelistedAttributes.push(attribute);
  }
}
