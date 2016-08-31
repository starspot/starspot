import { expect } from "chai";
import Application from "../src/application";
import Environment from "../src/environment";

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

  describe("config", function() {
    interface Config {
      isDevelopment?: boolean;
      mode?: string;
    }

    it("loads named config and extracts environment-appropriate config", function() {
      let app = new Application({
        rootPath: fixture("config-project"),
        env: new Environment("development")
      });

      let config = app.configFor<Config>("database-pojo");
      expect(config.isDevelopment).to.be.true;

      app = new Application({
        rootPath: fixture("config-project"),
        env: new Environment("production")
      });

      config = app.configFor<Config>("database-pojo");
      expect(config.isDevelopment).to.be.false;
    });

    it("invokes config function, passing environment", function() {
      let app = new Application({
        rootPath: fixture("config-project"),
        env: new Environment("test")
      });

      let config = app.configFor<Config>("database-function");
      expect(config.mode).to.equal("test");
    });

  });

});

function fixture(name: string): string {
  return __dirname + "/fixtures/" + name;
}
