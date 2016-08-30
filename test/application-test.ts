import { expect } from "chai";
import Application from "../src/application";

describe("Application", function() {

  it("runs initializers during boot", async function() {
    let initializers = [{
      name: "my-initializer",
      initialize(app: any) {
        app["didInitializeWithInitializer"] = true;
      }
    }];

    let app: any = new Application({
      initializers
    });

    await app.boot();

    expect(app["didInitializeWithInitializer"]).to.be.true;
  });

});