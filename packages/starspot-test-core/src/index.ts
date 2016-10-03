import {
  Application,
  Router,
  Container,
  Controller,
  UI
} from "starspot-core";

export interface Dict<T> {
  [key: string]: T;
}

export class Request implements Application.Request {
  public headers: { [key: string]: string };
  public body: string;

  constructor(public url: string, public method: string) {
    this.headers = {
      "accept": "application/json"
    };
  }
}

export class Response implements Application.Response {
  statusCode = 200;
  writeBuffer = "";

  _headers: Dict<string> = {};

  setHeader(header: string, content: string) {
    this._headers[header.toLowerCase()] = content;
  }

  getHeader(header: string) {
    return this._headers[header.toLowerCase()];
  }

  write(buffer: string | Buffer) {
    this.writeBuffer += buffer.toString();
    return true;
  }

  end() { }

  toJSON(): {} {
    return this.writeBuffer ? JSON.parse(this.writeBuffer) : undefined;
  }
}

export function createRequest(url: string, method: string = "GET"): Request {
  return new Request(url, method);
}

export function createJSONRequest(url: string, json: any): Request;
export function createJSONRequest(url: string, method: any, json?: any): Request;
export function createJSONRequest(url: string, method: any, json?: any): Request {
  if (arguments.length === 2) {
    if (typeof method !== "string") {
      json = method;
      method = "GET";
    }
  }

  let request = createRequest(url, method);
  request.body = JSON.stringify(json);

  return request;
}

export function createResponse(): Response {
  return new Response();
}

export function createApplication() {
  let container = new Container();
  let ui = new UI({ logLevel: UI.LogLevel.Error });
  let app = new Application({ container, ui });

  return new ApplicationBuilderDSL(app, container);
}

export interface Factory {
  new (): any;
}

export class ApplicationBuilderDSL {
  constructor(private app: Application,
              private container: Container) { }

  register(type: string, name: string, klass: Factory) {
    this.container.registerFactory(type, name, klass);
    return this;
  }

  controller(name: string, klass: typeof Controller & Factory) {
    return this.register("controller", name, klass);
  }

  routes(cb: (dsl: Router.DSL) => void) {
    this.container.registerFactory("router", Container.MAIN, class extends Router {
      map(dsl: Router.DSL) {
        cb(dsl);
      }
    });

    return this;
  }

  boot(): Promise<Application> {
    return this.app.boot()
      .then(() => this.app);
  }
}