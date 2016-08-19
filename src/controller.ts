import Resolver from "./resolver";
import Model from "./model";

abstract class Controller {
  abstract get<T>(): T[] | T;

  createModel(modelName: string): Model {
    let resolver = Resolver.metaFor(this).resolver;
    return resolver.findInstance("model", modelName);
  }
}

export default Controller;