import Controller from "../src/controller";
import { Readable } from "stream";
import { expect } from "chai";

describe("ControllerParameters", function() {

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
});
