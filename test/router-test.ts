import { expect } from "chai";
import { Router } from "../src/";

describe("Router", () => {

  describe("mapping", () => {

    it("supports simple routes", () => {
      class MyRouter extends Router {
        map() {
          this.route("my-route");
        }
      }

      let router = new MyRouter();
      router.seal();

      expect(router.hasRoute("my-route")).to.be.true;
    });

  });

});