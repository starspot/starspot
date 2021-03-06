import {
  Application,
  Router,
  Container,
  Controller,
  UI
} from "../../src";

export interface Dict<T> {
  [key: string]: T;
}

export class FakeRequest implements Application.Request {
  public headers: { [key: string]: string };
  public body: string;

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

  getHeader(header: string) {
    return this._headers[header];
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

  controller(name: string, klass: typeof Controller & Factory) {
    this.container.registerFactory("controller", name, klass);
    return this;
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
    let app = this.app;

    return app.boot()
      .then(() => app);
  }
}