import Controller from "../src/controller";
import Container from "../src/container";
import { Readable } from "stream";
import { expect } from "chai";

describe("Controller", function () {
  describe("Parameters", function() {

    it("provides request and response as properties", function() {
      let request: any = {};
      let response: any = {};
      let action = "action";
      let controllerName = "controllerName";

      let params = new Controller.Parameters({ request, response, action, controllerName });
      expect(params.request).to.equal(request);
      expect(params.response).to.equal(response);
    });

    it("parses JSON from the request's body if available", async function() {
      let request: any = {
        body: JSON.stringify({ "hello": "world" })
      };

      let response: any = {};
      let action = "action";
      let controllerName = "controllerName";

      let params = new Controller.Parameters({ request, response, action, controllerName });
      let json = await params.json();

      expect(json).to.deep.equal({
        hello: "world"
      });
    });

    describe("with a readable stream request", function () {
      let request: any = new Readable({
        read() {
          this.push(JSON.stringify({ "hello": "world" }));
          this.push(null);
        }
      });

      let response: any = {};
      let action = "action";
      let controllerName = "controllerName";

      let params = new Controller.Parameters({ request, response, action, controllerName });


      it("parses JSON", async function() {
        let json = await params.json();

        expect(json).to.deep.equal({
          hello: "world"
        });
      });

      it("can parse multiple times", async function () {
        await params.json();

        let json = await params.json();

        expect(json).to.deep.equal({
          hello: "world"
        });
      });
    });

    it("doesn't error on parsing when there is no body", async function () {
      let request: any = {
        body: ""
      };

      let response: any = {};
      let action = "action";
      let controllerName = "controllerName";

      let params = new Controller.Parameters({ request, response, action, controllerName });
      let json = await params.json();

      expect(json).to.be.undefined;
    });
  });

  describe("model helper methods", function () {

    let container = new Container();

    container.registerFactory("controller", "test", class extends Controller {});
    let controller = container.findInstance("controller", "test");

    class TestModel {}
    container.registerFactory("model", "test", TestModel);

    it("can find models", function () {
      expect(controller.findModel("test").constructor.name).to.equal("TestModel");
    });

    it("can create models", function () {
      expect(controller.createModel("test")).to.be.instanceOf(TestModel);
    });
  });
});
