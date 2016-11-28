import { expect } from "chai";
import { Router } from "../src/";
import { HTTPVerb } from "../src/router";

describe("Router", () => {

  describe("mapping", () => {

    ["GET", "POST", "PATCH", "DELETE", "OPTIONS"].forEach((method: HTTPVerb) => {
      it(`supports ${method} routes`, () => {
        class MyRouter extends Router {
          map(dsl: Router.DSL) {
            dsl[method.toLowerCase()]("my-route", {controller: "controller", method: "method"});
          }
        }

        let router = new MyRouter();
        router.seal();

        expect(router.handlersFor(method, "my-route").length).to.equal(1);
      });
    });

    it("supports resources", () => {
      class MyRouter extends Router {
        map({ resources }: Router.DSL) {
          resources("my-route");
        }
      }

      let router = new MyRouter();
      router.seal();

      expect(router.handlersFor("GET", "my-route").length).to.equal(1);
      expect(router.handlersFor("POST", "my-route").length).to.equal(1);
      expect(router.handlersFor("OPTIONS", "my-route").length).to.equal(1);
      expect(router.handlersFor("GET", "my-route/:id").length).to.equal(1);
      expect(router.handlersFor("PATCH", "my-route/:id").length).to.equal(1);
      expect(router.handlersFor("DELETE", "my-route/:id").length).to.equal(1);
      expect(router.handlersFor("OPTIONS", "my-route/:id").length).to.equal(1);
    });

  });

});
