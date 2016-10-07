declare module "route-recognizer" {
  class RouteRecognizer {
    add(routes: RouteRecognizer.Route[]): void;
    recognize(route: string): RouteRecognizer.RecognizeResults[];
  }

  namespace RouteRecognizer {
    interface Route {
      name: string;
      path: string;
    }

    interface RecognizeResults {
      handler: any,
      params: any,
      isDynamic: boolean
    }
  }

  export = RouteRecognizer;
}