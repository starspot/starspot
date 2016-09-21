import * as RouteRecognizer from "route-recognizer";

export type RecognizeResults = RouteRecognizer.RecognizeResults;

export interface Handler {
  controller: string;
  method: string;
}

interface Route extends RouteRecognizer.Route {
  handler: Handler;
}

interface Recognizers {
  [key: string]: RouteRecognizer;
}

export type HTTPVerb = "OPTIONS" | "GET" | "HEAD" | "POST" | "PUT" | "PATCH" | "DELETE";

abstract class Router {
  private routes: Route[] = [];
  private recognizers: Recognizers = {};
  private isMapping = false;

  abstract map(dsl: Router.DSL): void;

  seal() {
    this.isMapping = true;
    this.map(new Router.DSL(this));
    this.isMapping = false;
  }

  hasRoute(routeName: string): boolean {
    return !!this.routes.find(r => r.name === routeName);
  }

  private recognizerFor(verb: HTTPVerb, create?: boolean) {
    let recognizer = this.recognizers[verb];
    if (!recognizer && create) {
      recognizer = this.recognizers[verb] = new RouteRecognizer();
    }

    return recognizer;
  }

  addRoute(verb: HTTPVerb, path: string, controller: string, method: string) {
    let recognizer = this.recognizerFor(verb, true);

    let handler: Handler = { controller, method };
    let route: Route = { path, handler };

    recognizer.add([route]);
  }

  handlersFor(verb: HTTPVerb, path: string): RecognizeResults[] {
    let recognizer = this.recognizerFor(verb);

    if (recognizer) {
      return recognizer.recognize(path);
    }

    return null;
  }
}

namespace Router {
  export interface RouteOptions {
    controller: string;
    method: string;
  }

  /*
  * Implements the route map DSL. Note that the methods of this class are
  * implemented as function properties, not using method syntax. That's because
  * we want users to be able to use destructuring to pull off these functions in
  * their `map()` method, like so:
  *
  * ```js map({ resources }) {
  *   resources("photos");
  * })
  * ```
  *
  * When class methods are pulled out like this, they lose the binding to their
  * class instance when invoked. Instead, we set each DSL method to a function
  * expression which binds `this` to the appropriate lexical scope.
  * 
  */
  export class DSL {
    constructor(private _router: Router) {
    }

    resources = (routeName: string): void => {
      let router = this._router;
      let controller = routeName;
      let path = routeName;
      let memberPath = routeName + "/:id";

      // GET /photos -> PhotosController.index()
      router.addRoute("GET", path, controller, "index");
      // POST /photos -> PhotosController.create()
      router.addRoute("POST", path, controller, "create");
      // GET /photos/1234 -> PhotosController.show()
      router.addRoute("GET", memberPath, controller, "show");
      // PATCH /photos/1234 -> PhotosController.update()
      router.addRoute("PATCH", memberPath, controller, "update");
      // DELETE /photos/1234 -> PhotosController.destroy()
      router.addRoute("DELETE", memberPath, controller, "destroy");
    }

    get = (path: string, { controller, method }: RouteOptions): void => {
      let router = this._router;
      router.addRoute("GET", path, controller, method);
    }
  }
}

export default Router;