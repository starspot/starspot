import { expect } from "chai";
import RequestParser from "../src/request-parser";
import GetResourcesOperation from "../src/operations/get-resources";
import GetResourceOperation from "../src/operations/get-resource";
import { Container } from "starspot-core";
import { createRequest } from "starspot-test-core";
import UnhandledActionError from "../src/errors/unhandled-action-error";
import { ResourceTypeMismatch } from "../src/exceptions";

describe("Request Parser", function() {
  let container: Container;

  before(() => {
    container = new Container();

    container.registerFactory("resource", "photo", PhotoResource);
  });

  it("errors on invalid requests", async function () {
    let params = new Parameters("photos#wat");

    let parser = new RequestParser(params, container, new Target());

    try {
      await parser.parse();
      /* istanbul ignore next */
      expect(false).to.be.true("async function did not throw");
    } catch (e) {
      expect(e).to.be.an.instanceof(UnhandledActionError);
    }
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
    let params = new Parameters("photos#show", {urlParams: {"id": "123"}});

    let parser = new RequestParser(params, container, new Target());

    let operations = await parser.parse();

    expect(operations.length).to.equal(1);

    let operation = operations[0] as GetResourceOperation;
    expect(operation).to.be.an.instanceof(GetResourceOperation);
    expect(operation.id).to.equal("123");
  });

  describe("parsing create requests", function () {
    it("errors on type mismatch", async function () {
      let params = new Parameters("photos#create", {
        json: {
          data: {
            id: "123",
            type: "secret",
            attributes: {}
          }
        }
      });

      let parser = new RequestParser(params, container, new Target());

      try {
        await parser.parse();
        /* istanbul ignore next */
        expect(false).to.be.true("async function did not throw");
      } catch (e) {
        expect(e).to.be.an.instanceof(ResourceTypeMismatch);
      }
    });
  });

  describe("parsing update requests", function () {
    it("errors on type mismatch", async function () {
      let params = new Parameters("photos#update", {
        json: {
          data: {
            id: "123",
            type: "secret",
            attributes: {}
          }
        }
      });

      let parser = new RequestParser(params, container, new Target());

      try {
        await parser.parse();
        /* istanbul ignore next */
        expect(false).to.be.true("async function did not throw");
      } catch (e) {
        expect(e).to.be.an.instanceof(ResourceTypeMismatch);
      }
    });
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
  public urlParams: { [key: string]: any };
  private _json: any;

  constructor(target: string, {json, urlParams}: {json?: any, urlParams?: any} = {}) {
    let [controller, action] = target.split("#", 2);
    this.controllerName = controller;
    this.action = action;
    this.urlParams = urlParams;

    this._json = json;
  }

  async json() {
    return this._json;
  }
}
