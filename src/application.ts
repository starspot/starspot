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
    let handlers = this._router.handlersFor(request.method as HTTPVerb, request.url);

    if (!handlers) {
      response.setHeader("Content-Type", "text/html");
      response.statusCode = 404;
      response.write("<h2>Not found!</h2>");
      response.end();
      return Promise.resolve(response);
    }

    let result: any;

    for (let i = 0; i < handlers.length; i++) {
      let handler: Handler  = handlers[i].handler;

      let controller = this._resolver.findController(handler.controller);
      let method = handler.method;

      if (method && controller[method]) {
        result = controller[method]();
      }

      if (result) { break; }
    }

    return Promise.resolve(result)
      .then(model => {
        let json: JSONAPI.Document;

        if (Array.isArray(model)) {
          json = this._serializer.serializeMany(model);
        } else {
          json = this._serializer.serialize(model);
        }

        response.write(JSON.stringify(json));
        response.end();
      })
      .then(() => response);
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