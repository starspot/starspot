import {
  Application,
  Router,
  Resolver,
  Controller,
  Model,
  UI
} from "../../src";

export interface Dict<T> {
  [key: string]: T;
}

export class FakeRequest implements Application.Request {
  public headers: { [key: string]: string };

  constructor(public url: string, public method: string) {
    this.headers = {
      "accept": "application/json"
    };
  }
}

export class FakeResponse implements Application.Response {
  statusCode = 200;
  writeBuffer = "";

  _headers: Dict<string> = {};

  setHeader(header: string, content: string) {
    this._headers[header] = content;
  }

  write(buffer: string | Buffer) {
    this.writeBuffer += buffer.toString();
    return true;
  }

  end() { }

  toJSON(): {} {
    return JSON.parse(this.writeBuffer);
  }
}

export function createRequest(url: string, method: string = "GET"): FakeRequest {
  return new FakeRequest(url, method);
}

export function createResponse(): FakeResponse {
  return new FakeResponse();
}

export function createApplication(routes?: Function) {
  let resolver = new Resolver();
  let ui = new UI({ logLevel: UI.LogLevel.Error });
  let app = new Application({ resolver, ui });

  return new ApplicationBuilderDSL(app, resolver);
}

export interface Factory {
  new (): any;
}

export class ApplicationBuilderDSL {
  constructor(private app: Application,
              private resolver: Resolver) { }

  controller(name: string, klass: typeof Controller & Factory) {
    this.resolver.registerFactory("controller", name, klass);
    return this;
  }

  routes(cb: (dsl: Router.DSL) => void) {
    this.resolver.registerFactory("router", Resolver.MAIN, class extends Router {
      map(dsl: Router.DSL) {
        cb(dsl);
      }
    });

    return this;
  }

  model(name: string, klass: typeof Model & Factory) {
    this.resolver.registerFactory("model", name, klass);
    return this;
  }

  boot(): Promise<Application> {
    let { app } = this;

    return app.boot()
      .then(() => app);
  }
}