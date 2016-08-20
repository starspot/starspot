import { expect } from "chai";
import { Model, Controller } from "../src";
import * as test from "./helpers/application";

describe("route dispatching", function() {

  describe("top-level routes", function() {
    class PhotoController extends Controller {
      get() {
        let photo = this.createModel("photo") as Photo;
        photo.id = 1234;
        photo.firstName = "Tom";
        photo.lastName = "Dale";

        return photo;
      }
    }

    class Photo extends Model {
      static attributes = ["firstName", "lastName"];
      firstName: string;
      lastName: string;
    };

    it("routes GET requests to controller's get() method", async function() {

      let app = await test.createApplication()
        .routes(function() {
          this.route("photos");
        })
        .controller("photos", PhotoController)
        .model("photo", Photo)
        .boot();

      let request = test.createRequest("/photos");
      let response = test.createResponse();

      return app.dispatch(request, response)
        .then(() => {
          expect(response.toJSON()).to.deep.equal({
            data: {
              type: "photo",
              id: 1234,
              attributes: {
                firstName: "Tom",
                lastName: "Dale"
              }
            }
          });
        });
    });

    it("allows controller to return a promise", async function() {
      class PromisePhotoController extends Controller {
        get() {
          return new Promise(resolve => {
            let photo = this.createModel("photo") as Photo;
            photo.id = 1234;
            photo.firstName = "Tom";
            photo.lastName = "Dale";

            setTimeout(() => resolve(photo), 1000);
          });
        }
      }

      let app = await test.createApplication()
        .routes(function() {
          this.route("photos");
        })
        .controller("photos", PromisePhotoController)
        .model("photo", Photo)
        .boot();

      let request = test.createRequest("/photos");
      let response = test.createResponse();

      await app.dispatch(request, response);

      expect(response.toJSON()).to.deep.equal({
        data: {
          type: "photo",
          id: 1234,
          attributes: {
            firstName: "Tom",
            lastName: "Dale"
          }
        }
      });
    });

  });
});