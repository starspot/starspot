import { readFileSync } from "fs";
import { dirname } from "path";

import UI from "./ui";
import Router from "./router";
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
  }

  dispatch(request: Application.Request) {
    let path = request.url;

    let routes = this._router.handlersFor(path);

    for (let i = 0; i < routes.length; i++) {
      let routeName = routes[i].handler;
      let controller = this._resolver.findController(routeName);
      return controller.get();
    }

  }
}

namespace Application {
  export interface Request {
    method: string;
    url: string;
    headers?: any;
    trailers?: any;
  }
}


export default Application;