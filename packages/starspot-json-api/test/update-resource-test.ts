import { expect } from "chai";
import ResourceController, { after } from "../src/resource-controller";
import Resource, { attribute, updatable, readOnly, writableAttributes, updatableAttributes, creatableAttributes } from "../src/resource";
import JSONAPI from "../src/json-api";

import { createApplication, createResponse, createJSONRequest } from "starspot-test-core";
import Model from "./helpers/model";

// http://jsonapi.org/format/1.1/#fetching
describe("Fetching Data", function () {

  @writableAttributes("isWritable")
  @creatableAttributes("isCreatable")
  @updatableAttributes("isUpdatable")
  class PhotoResource extends Resource<Photo> {
    @attribute
    @updatable
    title: string;

    @attribute
    @updatable
    src: string;

    @attribute
    @readOnly({ ignoreWrites: true })
    fingerprint: string;

    @attribute
    @readOnly
    superEmoInfo: string;

    async updateAttributes(attributes: Resource.Attributes) {
      Object.assign(this.model, attributes);
    }

    static async findByID(id: JSONAPI.ID) {
      return new Photo({ id });
    }

  }

  class Photo extends Model { };

  // http://jsonapi.org/format/upcoming/#crud-updating
  describe("Updating Resources", function () {
    it("allows a resource to be updated", async function () {
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
          "id": "1234",
          "type": "photos",
          "attributes": {
            "title": "Ember Hamster",
            "src": "http://example.com/images/productivity.png",
            "is-writable": true,
            "is-updatable": true
          }
        }
      });

      await app.dispatch(request, response);

      expect(didUpdateWasCalled).to.be.true;
      expect(response.statusCode).to.equal(200);
      expect(response.getHeader("content-type")).to.equal("application/vnd.api+json");
      expect(response.toJSON()).to.deep.equal({
        data: {
          "type": "photos",
          "id": "1234",
          "attributes": {
            "title": "Ember Hamster",
            "src": "http://example.com/images/productivity.png",
            "is-writable": true,
            "is-updatable": true,
            "is-creatable": null,
            "fingerprint": null,
            "super-emo-info": null
          }
        }
      });

    });

    it("ignores a field that is presented for update but that has `@readOnly({ignoreWrites: true})`", async function() {
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
          "id": "1234",
          "type": "photos",
          "attributes": {
            "title": "Ember Hamster",
            "src": "http://example.com/images/productivity.png",
            "is-writable": true,
            "is-updatable": true,
            "fingerprint": "jsfkjh342kjl234kl"
          }
        }
      });

      await app.dispatch(request, response);

      expect(didUpdateWasCalled).to.be.true;
      expect(response.statusCode).to.equal(200);
      expect(response.getHeader("content-type")).to.equal("application/vnd.api+json");
      expect(response.toJSON()).to.deep.equal({
        data: {
          "type": "photos",
          "id": "1234",
          "attributes": {
            "title": "Ember Hamster",
            "src": "http://example.com/images/productivity.png",
            "is-writable": true,
            "is-updatable": true,
            "is-creatable": null,
            "fingerprint": null,
            "super-emo-info": null
          }
        }
      });
    });

    it("returns an exception when a field that is presented for update that is set to `@readOnly()`", async function() {
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
          "id": "1234",
          "type": "photos",
          "attributes": {
            "title": "Ember Hamster",
            "src": "http://example.com/images/productivity.png",
            "is-writable": true,
            "is-updatable": true,
            "super-emo-info": "OMG don't touch me!!!!"
          }
        }
      });

      await app.dispatch(request, response);

      expect(didUpdateWasCalled).to.be.false;

      expect(response.statusCode).to.equal(422);
      expect(response.getHeader("content-type")).to.equal("application/vnd.api+json");
      expect(response.toJSON()).to.deep.equal({
        errors: ["The super-emo-info attribute of type photos cannot be set during updates."]
      });
    });
  });
});

function createJSONAPIRequest(method: string, url: string, json?: any) {
  let request = createJSONRequest(url, method, json);
  request.headers["Content-Type"] = "application/vnd.api+json";

  return request;
}