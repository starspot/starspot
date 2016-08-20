import Resolver from "./resolver";
import Model from "./model";

interface Controller {
  index?<T>(): T[] | T | Promise<T[]> | Promise<T>;
  show?<T>(): T[] | T | Promise<T[]> | Promise<T>;
  create?<T>(): T[] | T | Promise<T[]> | Promise<T>;
  update?<T>(): T[] | T | Promise<T[]> | Promise<T>;
  delete?<T>(): T[] | T | Promise<T[]> | Promise<T>;
}

class Controller {
  createModel(modelName: string): Model {
    let resolver = Resolver.metaFor(this).resolver;
    return resolver.findInstance("model", modelName);
  }
}

export default Controller;