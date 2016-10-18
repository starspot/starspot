import { expect } from "chai";
import { createApplication, createResponse, createJSONRequest } from "starspot-test-core";
import { Reflector } from "starspot-core";
import ResourceController, { after } from "../src/resource-controller";
import Resource, { attribute, writableAttributes, updatableAttributes, creatableAttributes } from "../src/resource";
import Inflected = require("inflected");

// http://jsonapi.org/format/1.1/#fetching
describe("Fetching Data", function () {

  @writableAttributes("isWritable")
  @creatableAttributes("isCreatable")
  @updatableAttributes("isUpdatable")
  class PhotoResource extends Resource<any> {
    @attribute
    title: string;

    @attribute
    src: string;

    static async update(model: Model, options: Resource.UpdateOptions) {
      Object.assign(model, options.attributes);
    }
  }

  class Photo extends Model { };

  // http://jsonapi.org/format/upcoming/#crud-updating
  describe("Updating Resources", function () {
    it("allows a resource to be created", async function () {
      class PhotoController extends ResourceController {
        @after("update")
        didUpdate(model: Photo) {
          didUpdateWasCalled = true;
          expect(model).to.be.an.instanceof(Photo);
        }
      }

      let didUpdateWasCalled = false;

      let app = await createApplication()
        .routes(({ resources }) => {
          resources("photos");
        })
        .controller("photo", PhotoController)
        .register("resource", "photo", PhotoResource)
        .boot();

      let response = createResponse();
      let request = createJSONAPIRequest("PATCH", "/photos/123", {
        "data": {
          "id": "123",
          "type": "photos",
          "attributes": {
            "title": "Ember Hamster",
            "src": "http://example.com/images/productivity.png",
            "isWritable": true,
            "isUpdatable": true,
            "isCreatable": true
          }
        }
      });

      await app.dispatch(request, response);

      expect(didUpdateWasCalled).to.be.true;
      expect(response.statusCode).to.equal(201);
      expect(response.getHeader("content-type")).to.equal("application/vnd.api+json");
      expect(response.toJSON()).to.deep.equal({
        data: {
          "type": "photos",
          "id": "1234",
          "attributes": {
            "title": "Ember Hamster",
            "src": "http://example.com/images/productivity.png"
          },
        }
      });

    });
  });
});

function createJSONAPIRequest(method: string, url: string, json?: any) {
  let request = createJSONRequest(url, method, json);
  request.headers["Content-Type"] = "application/vnd.api+json";

  return request;
}

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

  async validate() {
    return true;
  }
}

class Model {
  _id: string;
  _setType: string;

  constructor(options: any) {
    this._id = options.id;
    delete options.id;

    Object.assign(this, options);
  }

  set _type(type: string) {
    this._setType = type;
  }

  get _type() {
    return this._setType || Inflected.dasherize(this.constructor.name).toLowerCase();
  }
}

Reflector.install(Model, new ModelReflector());