import UI from "./ui";
import Router, { Handler, HTTPVerb } from "./router";
import Serializer from "./json-api/serializer";
import JSONAPI from "./json-api/interfaces";
import Resolver from "./resolver";

export interface ConstructorOptions {
  ui?: UI;
  rootPath?: string;
  resolver?: Resolver;
}

class Application {
  protected ui: UI;

  private _rootPath: string;
  private _resolver: Resolver;
  private _router: Router;
  private _serializer: Serializer;

  constructor(options: ConstructorOptions = {}) {
    this.ui = options.ui || new UI();

    this._rootPath = options.rootPath;
    this._resolver = options.resolver;
  }

  async boot() {
    let resolver = this._resolver;

    if (!resolver) {
      resolver = this._resolver = new Resolver(this._rootPath);
    }

    let router = this._router = this._resolver.findInstance("router", Resolver.MAIN);
    router.seal();

    this._serializer = new Serializer();
  }

  dispatch(request: Application.Request, response: Application.Response): Promise<Application.Response> {
    let ui = this.ui;
    let { method: verb, url: path } = request;

    ui.info({
      name: "dispatch-start",
      verb,
      path
    });

    let handlers = this._router.handlersFor(verb as HTTPVerb, path);

    if (!handlers) {
      ui.info({
        name: "dispatch-not-found",
        verb,
        path
      });

      response.setHeader("Content-Type", "text/html");
      response.statusCode = 404;
      response.write("<h2>Not found!</h2>");
      response.end();
      return Promise.resolve(response);
    }

    let result: any;

    for (let i = 0; i < handlers.length; i++) {
      let handler: Handler  = handlers[i].handler;

      let controllerName = handler.controller;
      let controller = this._resolver.findController(controllerName);
      let method = handler.method;

      ui.info({
        name: "dispatch-dispatching",
        controller: controllerName,
        verb,
        path,
        method
      });

      if (method && controller[method]) {
        try {
          result = Promise.resolve(controller[method]());
        } catch (e) {
          result = Promise.reject(e);
        }
      }

      if (result) { break; }
    }

    return result
      .then((model: Serializer.Serializable) => {
        let json: JSONAPI.Document;

        if (Array.isArray(model)) {
          json = this._serializer.serializeMany(model);
        } else {
          json = this._serializer.serialize(model);
        }

        response.write(JSON.stringify(json));
        response.end();
      })
      .then(() => response)
      .catch((e: Error) => {
        response.statusCode = 500;
        response.write(e.stack);
        response.end();
      });

  }
}

namespace Application {
  export interface Request {
    method: string;
    url: string;
    headers?: any;
    trailers?: any;
  }

  export interface Response {
    statusCode: number;
    setHeader(header: string, value: string): void;
    write(chunk: Buffer | string, cb?: Function): boolean;
    end(): void;
  }
}


export default Application;