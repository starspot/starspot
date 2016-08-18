import { expect } from "chai";
import { Application, Router, Resolver, Controller } from "../src";

describe("route dispatching", function() {

  describe("top-level routes", function() {

    it("routes GET requests to controller's get() method", async function() {
      let app = await createApplication();
      let request = new GetRequest("/photos");

      app.dispatch(request);
    });

  });
});

class GetRequest implements Application.Request {
  method = "GET";

  constructor(public url: string) { }
}

async function createApplication(routes?: Function) {
  let resolver = new Resolver();
  let app = new Application({ resolver });

  resolver.registerFactory("controller", "photos", class extends Controller {
    get() {
      return ["hello world"];
    }
  });

  resolver.registerFactory("router", Resolver.MAIN, class extends Router {
    map() {
      if (routes) {
        routes.call(this);
      } else {
        this.route("photos");
      }
    }
  });

  await app.boot();

  return app;
}