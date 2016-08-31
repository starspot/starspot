import Application from "./application";
import Container from "./container";
import Model from "./model";

interface Controller {
  index?<T>(params: Controller.Parameters): T[] | T | Promise<T[]> | Promise<T> | void;
  show?<T>(params: Controller.Parameters): T[] | T | Promise<T[]> | Promise<T> | void;
  create?<T>(params: Controller.Parameters): T[] | T | Promise<T[]> | Promise<T> | void;
  update?<T>(params: Controller.Parameters): T[] | T | Promise<T[]> | Promise<T> | void;
  delete?<T>(params: Controller.Parameters): T[] | T | Promise<T[]> | Promise<T> | void;
}

class Controller {
  createModel(modelName: string): Model {
    let container = Container.metaFor(this).container;
    return container.findInstance("model", modelName);
  }
}

namespace Controller {
  export interface Parameters {
    response: Application.Response;
  }
}

export default Controller;
