import { expect } from "chai";
import { createApplication, createResponse, createJSONRequest } from "starspot-test-core";
import ResourceController from "../src/resource-controller";
import Resource from "../src/resource";
import Reflector from "../src/reflector";
import Inflected = require("inflected");
import Serializer from "../src/serializer";

function createJSONAPIRequest(method: string, url: string, json?: any) {
  let request = createJSONRequest(url, method, json);
  request.headers["Content-Type"] = "application/vnd.api+json";

  return request;
}

describe("Resources", function() {
  class ModelReflector implements Reflector {
    getType(model: any) {
      return model._type;
    }

    getID(model: any) {
      return model._id;
    }

    getAttributes(model: any) {
      let verboten = ["_id", "_type"];
      let attributes = Object.keys(model).filter(k => verboten.indexOf(k) < 0);

      return attributes;
    }

    getAttribute(model: any, attribute: string) {
      return model[attribute];
    }
  }

  class Model {
    _id: string;

    constructor(options: any) {
      this._id = options.id;
      delete options.id;

      Object.assign(this, options);
    }

    get _type() {
      return Inflected.dasherize(this.constructor.name).toLowerCase();
    }
  }

  Reflector.install(Model, new ModelReflector());

  class Photo extends Model {
  }

  class PhotosController extends ResourceController {
  }

  class PhotoResource extends Resource {
    static findAll() {
      return [new Photo({ id: "1245", name: "Steve" })];
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
      data: [{
        id: "1245",
        type: "photo",
        attributes: {
          name: "Steve"
        }
      }]
    });
  });
});