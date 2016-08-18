import * as RouteRecognizer from "route-recognizer";

interface Route {
  name: string;
  path: string;
  handler: any;
}

abstract class Router {
  private routes: Route[] = [];

  private recognizer: RouteRecognizer;
  private isMapping = false;
  private currentRoute: Route = null;

  abstract map(): void;

  constructor() {
    this.recognizer = new RouteRecognizer();
  }

  // Seal the class/**/
  seal() {
    this.isMapping = true;
    this.map();
    this.isMapping = false;
  }

  hasRoute(routeName: string): boolean {
    return !!this.routes.find(r => r.name === routeName);
  }

  public route(routeName: string) {
    if (!this.isMapping) {
      throw new Error("Router: You can't call the router's route() method outside of the map() method.");
    }

    let route = routeFromRouteName(routeName);

    let routes = [route];
    this.recognizer.add(routes);
    this.routes.push(route);
    this.currentRoute = route;
  }

  handlersFor(route: string): RouteRecognizer.RecognizeResults[] {
    return this.recognizer.recognize(route);
  }
}

function routeFromRouteName(routeName: string): Route {
  return {
    name: routeName,
    path: routeName,
    handler: routeName
  };
}

export default Router;