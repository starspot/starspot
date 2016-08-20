import { expect } from "chai";
import { Application, Router, Resolver, Controller, Model } from "../src";

describe("route dispatching", function() {

  describe("top-level routes", function() {

    it("routes GET requests to controller's get() method", async function() {
      let app = await createApplication();
      let request = new GetRequest("/photos");
      let response = new ServerResponse();

      return app.dispatch(request, response)
        .then((response: ServerResponse) => {
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
});

class GetRequest implements Application.Request {
  method = "GET";

  constructor(public url: string) { }
}

class ServerResponse implements Application.Response {
  writeBuffer = "";

  write(buffer: string | Buffer) {
    this.writeBuffer += buffer.toString();
    return true;
  }

  end() { }

  toJSON(): {} {
    return JSON.parse(this.writeBuffer);
  }
}

async function createApplication(routes?: Function) {
  let resolver = new Resolver();
  let app = new Application({ resolver });
  class Photo extends Model {
    static attributes = ["firstName", "lastName"];
    firstName: string;
    lastName: string;
  };

  resolver.registerFactory("controller", "photos", class extends Controller {
    get() {
      let photo = this.createModel("photo") as Photo;
      photo.id = 1234;
      photo.firstName = "Tom";
      photo.lastName = "Dale";

      return photo;
    }
  });

  resolver.registerFactory("router", Resolver.MAIN, class extends Router {
    map() {
      if (routes) {
        routes.call(this);
      } else {
        this.route("photos");
      }
    }
  });

  resolver.registerFactory("model", "photo", Photo);

  await app.boot();

  return app;
}