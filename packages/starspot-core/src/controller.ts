import getRawBody = require("raw-body");
import { Readable } from "stream";
import Application from "./application";
import Container from "./container";

interface Controller {
  index?<T>(params: Controller.Parameters): T[] | T | Promise<T[]> | Promise<T> | void;
  show?<T>(params: Controller.Parameters): T[] | T | Promise<T[]> | Promise<T> | void;
  create?<T>(params: Controller.Parameters): T[] | T | Promise<T[]> | Promise<T> | void;
  update?<T>(params: Controller.Parameters): T[] | T | Promise<T[]> | Promise<T> | void;
  delete?<T>(params: Controller.Parameters): T[] | T | Promise<T[]> | Promise<T> | void;
}

class Controller {
  createModel<T>(modelName: string): T {
    let container = Container.metaFor(this).container;
    return container.findInstance("model", modelName);
  }
}

export default Controller;

namespace Controller {
  export interface ParameterConstructorOptions {
    request: Application.Request;
    response: Application.Response;
    action: string;
    controllerName: string;
  }

  export class Parameters {
    request: Application.Request;
    response: Application.Response;
    action: string;
    controllerName: string;

    constructor(options: ParameterConstructorOptions) {
      this.request = options.request;
      this.response = options.response;
      this.action = options.action;
      this.controllerName = options.controllerName;
    }

    json(): Promise<any> {
      let request = this.request;
      let body: Promise<string | Buffer>;

      if (request instanceof Readable) {
        body = getRawBody(request);
      } else if (request.body !== undefined) {
        body = Promise.resolve(request.body);
      } else {
        return Promise.resolve(null);
      }

      return body.then(data => {
        data = data.toString();
        return JSON.parse(data);
      });
    }
  }
}