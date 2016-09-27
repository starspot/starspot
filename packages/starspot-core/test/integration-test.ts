import { expect } from "chai";
import { Controller } from "../src";
import * as test from "./helpers/application";

describe("Integration: Route Dispatching", function () {

  describe("responses", function () {

    it("passes the response to the controller", async function () {
      let request = test.createRequest("/photos");
      let response = test.createResponse();
      let wasDispatched = false;

      class PhotoController extends Controller {
        show({ response: passedResponse }: Controller.Parameters) {
          expect(passedResponse).to.equal(response);
          wasDispatched = true;
        }
      }

      let app = await test.createApplication()
        .routes(({ get }) => {
          get("photos", { controller: "photos", method: "show" });
        })
        .controller("photos", PhotoController)
        .boot();

      await app.dispatch(request, response);
      expect(wasDispatched).to.be.true;
    });
  });

  describe("resources", function () {
    class PhotoController extends Controller {
      index() {
        return [{
          id: "1234",
          firstName: "Tom",
          lastName: "Dale"
        }, {
          id: "4567",
          firstName: "Zahra",
          lastName: "Jabini"
        }];
      }
    }

    it("routes GET /<resource> to controller's index() method", async function () {

      let app = await test.createApplication()
        .routes(({ resources }) => {
          resources("photos");
        })
        .controller("photos", PhotoController)
        .boot();

      let request = test.createRequest("/photos");
      let response = test.createResponse();

      await app.dispatch(request, response);

      expect(response.toJSON()).to.deep.equal([{
        id: "1234",
        firstName: "Tom",
        lastName: "Dale"
      }, {
        id: "4567",
        firstName: "Zahra",
        lastName: "Jabini"
      }]);
    });

    it("allows controller to return a promise", async function () {
      class PromisePhotoController extends Controller {
        index() {
          return new Promise(resolve => {
            setImmediate(() => {
              resolve([{
                id: "1234",
                firstName: "Tom",
                lastName: "Dale"
              }, {
                id: "4567",
                firstName: "Zahra",
                lastName: "Jabini"
              }]);
            });
          });
        }
      }

      let app = await test.createApplication()
        .routes(({ resources }) => {
          resources("photos");
        })
        .controller("photos", PromisePhotoController)
        .boot();

      let request = test.createRequest("/photos");
      let response = test.createResponse();

      await app.dispatch(request, response);

      expect(response.toJSON()).to.deep.equal([{
        id: "1234",
        firstName: "Tom",
        lastName: "Dale"
      }, {
        id: "4567",
        firstName: "Zahra",
        lastName: "Jabini"
      }]);
    });
  });

  it("reports 500 if error during dispatching", async function () {
    class ErrorPhotoController extends Controller {
      index() {
        throw new Error();
      }
    }

    let app = await test.createApplication()
      .routes(({ resources }) => {
        resources("photos");
      })
      .controller("photos", ErrorPhotoController)
      .boot();

    let request = test.createRequest("/photos");
    let response = test.createResponse();

    await app.dispatch(request, response);

    expect(response.statusCode).to.equal(500);
  });

  it("passes the JSON body as a parameter", async function () {
    let wasCalled = false;

    class BodyPhotoController extends Controller {
      async index(params: Controller.Parameters) {
        let data = await params.json();
        expect(data).to.deep.equal({ Hello: "world" });
        wasCalled = true;
      }
    }

    let app = await test.createApplication()
      .routes(({ resources }) => {
        resources("photos");
      })
      .controller("photos", BodyPhotoController)
      .boot();

    let request = test.createRequest("/photos");
    let response = test.createResponse();

    request.body = JSON.stringify({ Hello: "world" });

    await app.dispatch(request, response);
    expect(wasCalled).to.be.true;
  });
});