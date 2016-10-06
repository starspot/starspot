import { expect } from "chai";
import { createApplication, createResponse, createJSONRequest } from "starspot-test-core";
import ResourceController from "../src/resource-controller";
import Resource, { attribute } from "../src/resource";
import Reflector from "../src/reflector";
import Inflected = require("inflected");

// http://jsonapi.org/format/1.1/#fetching
describe("Fetching Data", function () {

  // http://jsonapi.org/format/1.1/#fetching-resources
  describe("Fetching Resources", function () {

    it("generates index documents", async function () {

      @attribute("title")
      class ArticleResource extends Resource {
        static findAll() {
          return [new Model({
            _type: "articles",
            _id: 1,
            title: "JSON API paints my bikeshed!"
          }), new Model({
            _type: "articles",
            _id: 2,
            title: "Rails is Omakase"
          })];
        }
      }

      let app = await createApplication()
        .routes(({ resources }) => {
          resources("articles");
        })
        .controller("articles", class extends ResourceController { })
        .register("resource", "article", ArticleResource)
        .boot();

      let request = createJSONAPIRequest("GET", "/articles");
      let response = createResponse();

      await app.dispatch(request, response);

      expect(response.getHeader("content-type")).to.equal("application/vnd.api+json");

      // A server MUST respond to a successful request to fetch an individual
      // resource or resource collection with a 200 OK response.
      expect(response.statusCode).to.equal(200);

      // A server MUST respond to a successful request to fetch a resource
      // collection with an array of resource objects or an empty array ([]) as
      // the response document’s primary data.
      expect(response.toJSON()).to.deep.equal({
        data: [{
          "type": "articles",
          "id": "1",
          "attributes": {
            "title": "JSON API paints my bikeshed!"
          }
        }, {
          "type": "articles",
          "id": "2",
          "attributes": {
            "title": "Rails is Omakase"
          }
        }]
      });
    });

  });

  // http://jsonapi.org/format/upcoming/#crud-creating
  describe("Creating Resources", function () {
    it("allows a resource to be created", async function () {

      @attribute("title")
      class PhotoResource extends Resource {
      }

      let app = await createApplication()
        .routes(({ resources }) => {
          resources("photos");
        })
        .controller("photos", class extends ResourceController { })
        .register("resource", "photo", PhotoResource)
        .boot();

      let response = createResponse();
      let request = createJSONAPIRequest("POST", "/photos", {
        "data": {
          "type": "photos",
          "attributes": {
            "title": "Ember Hamster",
            "src": "http://example.com/images/productivity.png"
          }
        }
      });

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