import UI from "./ui";
import Router, { Handler, HTTPVerb } from "./router";
import Serializer from "./json-api/serializer";
import JSONAPI from "./json-api/interfaces";
import Resolver from "./resolver";
import jsonToHTML from "./util/json-to-html";

export interface ConstructorOptions {
  ui?: UI;
  rootPath?: string;
  resolver?: Resolver;
}

const STYLESHEET = `
  body {
    background-color: #002b36;
  }

  main {
    font: 16px Menlo, Monaco, monospace;
  }

  pre {
    margin: 0;
    font: inherit;
    padding: 16px;
    line-height: 1.4em;
  }

  .json {
    color: #93a1a1;
  }

  .json .control {
    color: #586e75;
  }

  .json a {
    color: inherit;
    text-decoration:  none;
  }

  .json a span.text {
    border-bottom: 2px solid #F1F3F6;
  }

  .json .key {
    color: #268bd2;
    font-weight: bold;
  }

  .json > .dictionary > .key-content .key {
    color: #214373;
  }

  .json > .dictionary > .key-content .string,
  .json > .dictionary > .key-title .string,
  .json > .dictionary > .key-summary .string,
  .json > .dictionary > .key-id .string {
    color: #496281;
  }

  .json > .dictionary > .key-content .number,
  .json > .dictionary > .key-title .number,
  .json > .dictionary > .key-summary .number,
  .json > .dictionary > .key-id .number {
    color: #13BAA6;
  }

  .json > .dictionary > .key-content .null,
  .json > .dictionary > .key-content .boolean,
  .json > .dictionary > .key-content .number,
  .json > .dictionary > .key-title .null,
  .json > .dictionary > .key-title .boolean,
  .json > .dictionary > .key-title .number,
  .json > .dictionary > .key-summary .null,
  .json > .dictionary > .key-summary .boolean,
  .json > .dictionary > .key-summary .number,
  .json > .dictionary > .key-id .null,
  .json > .dictionary > .key-id .boolean,
  .json > .dictionary > .key-id .number {
    color: #FF416C;
  }

  .json > .dictionary > .key-content > .key,
  .json > .dictionary > .key-title > .key,
  .json > .dictionary > .key-summary > .key,
  .json > .dictionary > .key-id > .key {
    color: #0070FF;
  }`;

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
          result = Promise.resolve(controller[method]({ response }));
        } catch (e) {
          result = Promise.reject(e);
        }
      } else {
        result = Promise.resolve({});
      }

      if (result) { break; }
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
          response.setHeader("Content-Type", "text/html");
          response.write(`<html><head><style>${STYLESHEET}</style></head><body><main><pre class="json">`);
          response.write(jsonToHTML(json || model));
          response.write("</pre></main></body></html>");
        } else {
          response.setHeader("Content-Type", "application/json");
          response.write(JSON.stringify(json || model));
        }

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
    headers: { [key: string]: string };
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