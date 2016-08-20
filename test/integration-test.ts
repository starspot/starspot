import { expect } from "chai";
import { Model, Controller } from "../src";
import * as test from "./helpers/application";

describe("route dispatching", function() {

  describe("resources", function() {
    class PhotoController extends Controller {
      index() {
        let photo1 = new Photo({
          id: 1234,
          firstName: "Tom",
          lastName: "Dale"
        });

        let photo2 = new Photo({
          id: 4567,
          firstName: "Zahra",
          lastName: "Jabini"
        });

        return [photo1, photo2];
      }
    }

    class Photo extends Model {
      static attributes = ["firstName", "lastName"];
      firstName: string;
      lastName: string;
    };

    it("routes GET /<resource> to controller's index() method", async function() {

      let app = await test.createApplication()
        .routes(function() {
          this.resource("photos");
        })
        .controller("photos", PhotoController)
        .model("photo", Photo)
        .boot();

      let request = test.createRequest("/photos");
      let response = test.createResponse();

      return app.dispatch(request, response)
        .then(() => {
          expect(response.toJSON()).to.deep.equal({
            data: [{
              type: "photo",
              id: 1234,
              attributes: {
                firstName: "Tom",
                lastName: "Dale"
              }
            }, {
              type: "photo",
              id: 4567,
              attributes: {
                firstName: "Zahra",
                lastName: "Jabini"
              }
            }]
          });
        });
    });

    it("allows controller to return a promise", async function() {
      class PromisePhotoController extends Controller {
        index() {
          return new Promise(resolve => {
            let photo = this.createModel("photo") as Photo;
            photo.id = 1234;
            photo.firstName = "Tom";
            photo.lastName = "Dale";

            setImmediate(() => resolve(photo));
          });
        }
      }

      let app = await test.createApplication()
        .routes(function() {
          this.resource("photos");
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