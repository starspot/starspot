import UI from "./ui";
import { Handler, HTTPVerb } from "./router";
import Serializer from "./json-api/serializer";
import JSONAPI from "./json-api/interfaces";
import Resolver from "./resolver";
import { jsonToHTMLDocument } from "./util/json-to-html";

export interface ConstructorOptions {
  ui?: UI;
  rootPath?: string;
  resolver?: Resolver;
}

class Application {
  protected ui: UI;

  private _rootPath: string;
  private _resolver: Resolver;
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

    this._serializer = new Serializer();
  }

  dispatch(request: Application.Request, response: Application.Response): Promise<Application.Response> {
    let startTime = process.hrtime();

    let ui = this.ui;
    let { method: verb, url: path } = request;

    ui.info({
      name: "dispatch-start",
      verb,
      path
    });

    let router = this._resolver.findInstance("router", Resolver.MAIN);
    router.seal();
    let handlers = router.handlersFor(verb as HTTPVerb, path);

    if (!handlers) {
      this.routeNotFound(request, response, verb, path);
      return Promise.resolve(response);
    }

    let result: any;

    let handler: Handler  = handlers[0].handler;

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

    if (controller && controller[method]) {
      try {
        let controllerParams = { response };
        result = Promise.resolve(controller[method](controllerParams));
      } catch (e) {
        result = Promise.reject(e);
      }
    } else {
      this.controllerMethodNotFound(request, response, controllerName, method);
      return Promise.resolve(response);
    }

    return result
      .then((model: Serializer.Serializable) => {
        let json: JSONAPI.Document;
        let serializer = this._serializer;

        if (Array.isArray(model)) {
          if (model[0] && serializer.canSerialize(model[0])) {
            json = serializer.serializeMany(model);
          }
        } else if (serializer.canSerialize(model)) {
          json = serializer.serialize(model);
        }

        if (request.headers["accept"].split(",").map((s: string) => s.split(";")[0]).indexOf("text/html") > -1) {
          this.sendJSONAsHTML(json || model, response);
        } else {
          response.setHeader("Content-Type", "application/json");
          response.write(JSON.stringify(json || model));
        }

        response.end();

        this.ui.info({
          name: "dispatch-complete",
          controller: controllerName,
          verb,
          path,
          method,
          time: process.hrtime(startTime)
        });

        return response;
      })
      .catch((e: Error) => {
        response.statusCode = 500;
        response.write(e.stack);
        response.end();
      });

  }

  routeNotFound(_: Application.Request, response: Application.Response, verb: string, path: string): void {
    this.ui.info({
      name: "dispatch-route-not-found",
      verb,
      path
    });

    response.setHeader("Content-Type", "text/html");
    response.statusCode = 404;
    response.write("<h2>Not found!</h2>");
    response.end();
  }

  controllerMethodNotFound(request: Application.Request, response: Application.Response, controller: string, method: string): void {
    this.ui.info({
      name: "dispatch-route-not-found",
      controller,
      method
    });

    response.setHeader("Content-Type", "text/html");
    response.statusCode = 404;
    response.end(jsonToHTMLDocument({
      error: "Controller method not found",
      controller,
      method,
      request: `${request.method} ${request.url}`
    }));
    response.end();
  }

  sendJSONAsHTML(json: any, response: Application.Response)  {
    response.setHeader("Content-Type", "text/html; charset=utf-8");
    response.end(jsonToHTMLDocument(json));
  }
}

namespace Application {
  export interface Request {
    method: string;
    url: string;
    headers: { [key: string]: string };
    trailers?: any;
  }

  export interface Response {
    statusCode: number;
    setHeader(header: string, value: string): void;
    write(chunk: Buffer | string, cb?: Function): boolean;
    end(chunk?: Buffer | string): void;
  }
}


export default Application;