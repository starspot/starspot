import UI from "./ui";
import { Handler, HTTPVerb } from "./router";
import JSONAPI, { Serializer } from "starspot-json-api";
import Container from "./container";
import Environment from "./environment";
import Controller from "./controller";
import { jsonToHTMLDocument } from "./util/json-to-html";

class Application {
  public container: Container;

  protected ui: UI;
  protected initializers: Application.Initializer[];
  protected env: Environment;

  private _rootPath: string;
  private _serializer: Serializer;

  constructor(options: Application.ConstructorOptions = {}) {
    this.ui = options.ui || new UI();
    this.env = options.env || new Environment();
    this.initializers = options.initializers || [];

    this._rootPath = options.rootPath;
    this._serializer = new Serializer();

    this.container = options.container || new Container({
      rootPath: this._rootPath
    });
  }

  async boot() {
    this.invokeInitializers();
  }

  configFor<T>(name: string): T {
    let config = this.container.findModule("config", name);
    let mode = this.env.mode;

    if (typeof config === "function") {
      return config(this.env);
    } else {
      return config[mode];
    }
  }

  invokeInitializers() {
    this.initializers.forEach(initializer => {
      initializer.initialize(this);
    });
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

    let result: any;
    let controllerName: string;
    let method: string;

    try {
      let router = this.container.findInstance("router", Container.MAIN);
      router.seal();
      let handlers = router.handlersFor(verb as HTTPVerb, path);

      if (!handlers) {
        this.routeNotFound(request, response, verb, path);
        return Promise.resolve(response);
      }

      let handler: Handler  = handlers[0].handler;

      controllerName = handler.controller;
      method = handler.method;

      let controller = this.container.findController(controllerName);

      ui.info({
        name: "dispatch-dispatching",
        controller: controllerName,
        verb,
        path,
        method
      });

      if (controller && controller[method]) {
        try {
          let params = new Controller.Parameters(request, response);
          result = Promise.resolve(controller[method](params));
        } catch (e) {
          result = Promise.reject(e);
        }
      } else {
        this.controllerMethodNotFound(request, response, controllerName, method);
        return Promise.resolve(response);
      }
    } catch (e) {
      return Promise.reject(e);
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

        if (expectsHTMLResponse(request)) {
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

function expectsHTMLResponse(request: Application.Request): boolean {
  let accept = request.headers["accept"];

  if (!accept) { return false; }

  // Turns "text/plain; q=0.5, text/html, text/x-dvi; q=0.8, text/x-c" into
  // ["text/plain", "text/html", "text/x-dvi", "text/x-c"]
  let mediaRanges = accept.split(",").map((s: string) => s.split(";")[0].trim());

  return mediaRanges.indexOf("text/html") > -1;
}

namespace Application {
  export interface Request {
    method: string;
    url: string;
    headers: { [key: string]: string };
    trailers?: any;
    body?: Buffer | string;
  }

  export interface Response {
    statusCode: number;
    setHeader(header: string, value: string): void;
    write(chunk: Buffer | string, cb?: Function): boolean;
    end(chunk?: Buffer | string): void;
  }

  export interface Initializer {
    name: string;
    initialize: (app: Application) => void;
  };

  export interface ConstructorOptions {
    ui?: UI;
    rootPath?: string;
    container?: Container;
    initializers?: Application.Initializer[];
    env?: Environment;
  }
}


export default Application;