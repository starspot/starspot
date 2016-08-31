import { expect } from "chai";
import Resolver from "../src/resolver";
import Container from "../src/container";

describe("Resolver", function() {

  it("resolves paths for MAIN entities", function() {
    let resolver = new Resolver();
    let paths = resolver.resolvePaths(["router", Container.MAIN]);

    expect(paths).to.deep.equal([
      "app/router"
    ]);
  });

  it("resolves paths for config modules", function() {
    let resolver = new Resolver();
    let paths = resolver.resolvePaths(["config", "database"]);

    expect(paths).to.deep.equal([
      "config/database"
    ]);
  });

  it("resolves paths for resource modules", function() {
    let resolver = new Resolver();
    let paths = resolver.resolvePaths(["controller", "photos"]);

    expect(paths).to.deep.equal([
      "app/resources/photos/controller",
      "app/controllers/photos"
    ]);
  });

  it("throws if a module is found without a default export", function() {
    let resolver = new Resolver({
      rootPath: fixture("resolver")
    });

    expect(function() {
      resolver.resolve(["controller", "no-default-export"]);
    }).to.throw("no-default-export");
  });

  it("requires the first-available resolved path", function() {
    let resolver = new Resolver({
      rootPath: fixture("resolver")
    });

    let [controller] = resolver.resolve<any>(["controller", "photos"]);
    expect(controller.isPhotosController).to.be.true;

    [controller] = resolver.resolve<any>(["controller", "posts"]);
    expect(controller.isPostsController).to.be.true;
  });

  it("throws if conflicting modules exist on disk", function() {
    let resolver = new Resolver({
      rootPath: fixture("resolver"),
      throwOnConflict: true
    });

    try {
      resolver.resolve(["controller", "ambiguous"]);
    } catch (e) {
      expect(e.name).to.equal("conflicting-modules");
      expect(e.entityName).to.equal("ambiguous");
      expect(e.entityType).to.equal("controller");
      expect(e.paths).to.deep.equal([
        "app/controllers/ambiguous",
        "app/resources/ambiguous/controller"
      ]);
    }
  });

});

function fixture(name: string): string {
  return __dirname + "/fixtures/" + name;
}