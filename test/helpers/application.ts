import { Application, Router, Resolver, Controller, Model } from "../../src";

interface Dict<T> {
  [key: string]: T;
}

class FakeRequest implements Application.Request {
  constructor(public url: string, public method: string) { }
}

class FakeResponse implements Application.Response {
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
  let app = new Application({ resolver });

  return new ApplicationBuilderDSL(app, resolver);
}

interface Factory {
  new (): any;
}

class ApplicationBuilderDSL {
  constructor(private app: Application,
              private resolver: Resolver) { }

  controller(name: string, klass: typeof Controller & Factory) {
    this.resolver.registerFactory("controller", name, klass);
    return this;
  }

  routes(cb: () => void) {
    this.resolver.registerFactory("router", Resolver.MAIN, class extends Router {
      map() {
        cb.call(this);
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