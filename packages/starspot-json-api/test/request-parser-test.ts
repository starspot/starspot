import { expect } from "chai";
import RequestParser from "../src/request-parser";
import GetResourcesOperation from "../src/operations/get-resources";
import GetResourceOperation from "../src/operations/get-resource";
import { Container } from "starspot-core";
import { createRequest } from "starspot-test-core";

describe("Request Parser", function() {
  let container: Container;

  before(() => {
    container = new Container();

    container.registerFactory("resource", "photo", PhotoResource);
  });

  it("parses index requests", async function() {
    let params = new Parameters("photos#index");

    let parser = new RequestParser(params, container, new Target());

    let operations = await parser.parse();

    expect(operations.length).to.equal(1);

    let operation = operations[0];
    expect(operation).to.be.an.instanceof(GetResourcesOperation);
  });

  it("parses show requests", async function () {
    let params = new Parameters("photos#show");

    let parser = new RequestParser(params, container, new Target());

    let operations = await parser.parse();

    expect(operations.length).to.equal(1);

    let operation = operations[0];
    expect(operation).to.be.an.instanceof(GetResourceOperation);
  });
});

class Target {
  async invokeCallback() { }
}

class PhotoResource {
}

class Parameters {
  public action: string;
  public controllerName: string;
  public request = createRequest("/", "GET");
  private _json: any;

  constructor(target: string, json?: any) {
    let [controller, action] = target.split("#", 2);
    this.controllerName = controller;
    this.action = action;

    this._json = json;
  }

  async json() {
    return this._json;
  }
}
