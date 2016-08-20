declare module "route-recognizer" {
  class RouteRecognizer {
    add(routes: RouteRecognizer.Route[]): void;
    recognize(route: string): RouteRecognizer.RecognizeResults[];
  }

  namespace RouteRecognizer {
    interface Route {
      name?: string;
      path: string;
      handler: any;
    }

    interface RecognizeResults {
      handler: any,
      params: any,
      isDynamic: boolean
    }
  }

  export = RouteRecognizer;
}