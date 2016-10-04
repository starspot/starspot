import { expect } from "chai";
import { createApplication, createResponse, createJSONRequest } from "starspot-test-core";
import ResourceController from "../src/resource-controller";
import Resource from "../src/resource";
import Serializer from "../src/serializer";

function createJSONAPIRequest(method: string, url: string, json?: any) {
  let request = createJSONRequest(url, method, json);
  request.headers["Content-Type"] = "application/vnd.api+json";

  return request;
}

describe("Resources", function() {
  class Model {
    static attributes: string[];
    [attribute: string]: any;
    _type: string;
    _id: string;
  }

  class ModelSerializer implements Serializer.Protocol<Model> {
    getType(model: Model) {
      return model._type;
    }

    getID(model: Model) {
      return model._id;
    }

    getAttributes(model: Model) {
      return (model.constructor as typeof Model).attributes;
    }

    getAttribute(model: Model, attribute: string) {
      return model[attribute];
    }
  }

  class PhotosController extends ResourceController {
  }

  class PhotoResource extends Resource {
    findAll() {
      return [{ id: "1245", name: "Steve" }];
    }
  };

  it("generates index documents", async function() {
    let app = await createApplication()
      .routes(({ resources }) => {
        resources("photos");
      })
      .controller("photos", PhotosController)
      .register("resource", "photo", PhotoResource)
      .boot();

    let request = createJSONAPIRequest("GET", "/photos");
    let response = createResponse();

    await app.dispatch(request, response);

    expect(response.statusCode).to.equal(200);
    expect(response.getHeader("content-type")).to.equal("application/vnd.api+json");
    expect(response.toJSON()).to.deep.equal({
      data: []
    });
  });
});