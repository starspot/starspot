import Controller from "../src/controller";
import { Readable } from "stream";
import { expect } from "chai";

describe("ControllerParameters", function() {

  it("provides request and response as properties", function() {
    let req: any = {};
    let res: any = {};

    let params = new Controller.Parameters(req, res);
    expect(params.request).to.equal(req);
    expect(params.response).to.equal(res);
  });

  it("parses JSON from the request's body if available", async function() {
    let request: any = {
      body: JSON.stringify({ "hello": "world" })
    };

    let params = new Controller.Parameters(request, null);
    let json = await params.json();

    expect(json).to.deep.equal({
      hello: "world"
    });
  });

  it("parses JSON from the request if it is a readable stream", async function() {
    let request: any = new Readable({
      read(size) {
        this.push(JSON.stringify({ "hello": "world" }));
        this.push(null);
      }
    });

    let params = new Controller.Parameters(request, null);
    let json = await params.json();

    expect(json).to.deep.equal({
      hello: "world"
    });
  });
});