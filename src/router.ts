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

  abstract map(): void;

  seal() {
    this.isMapping = true;
    this.map();
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

  private addRoute(verb: HTTPVerb, path: string, controller: string, method: string) {
    let recognizer = this.recognizerFor(verb, true);

    let handler: Handler = { controller, method };
    let route: Route = { path, handler };

    recognizer.add([route]);
  }

  resource(routeName: string) {
    if (!this.isMapping) {
      throw new Error("Router: You can't call the router's resource() method outside of the map() method.");
    }

    this.addRoute("GET", routeName, routeName, "index");
  }

  handlersFor(verb: HTTPVerb, path: string): RecognizeResults[] {
    let recognizer = this.recognizerFor(verb);

    if (recognizer) {
      return recognizer.recognize(path);
    }

    return null;
  }
}

export default Router;