import getRawBody = require("raw-body");
import { Readable } from "stream";
import Application from "./application";
import Container from "./container";
import Model from "./model";
import JSONAPI from "starspot-json-api";

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

export default Controller;

namespace Controller {
  export class Parameters {
    constructor(public request: Application.Request,
                public response: Application.Response) {
    }

    get json(): Promise<JSONAPI.Document> {
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