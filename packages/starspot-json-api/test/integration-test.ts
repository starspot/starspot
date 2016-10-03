import { expect } from "chai";
import { createApplication, createResponse, createJSONRequest } from "starspot-test-core";
import ResourceController from "../src/resource-controller";
import Resource from "../src/resource";

function createJSONAPIRequest(method: string, url: string, json?: any) {
  let request = createJSONRequest(url, method, json);
  request.headers["Content-Type"] = "application/vnd.api+json";

  return request;
}

describe("Resources", function() {
  let PhotosController = class extends ResourceController {
  };

  let PhotoResource = class extends Resource {
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