import { expect } from "chai";
import fixture from "./helpers/fixture";

import Container, { Key } from "../src/container";
import { Resolution } from "../src/resolver";

describe("Container", function() {

  it("resolves to a null value if entity cannot be found", function() {
    let container = new Container({
      rootPath: fixture("resolver")
    });

    let value = container.findFactory("controller", "nonexistent");
    expect(value).to.be.null;

    value = container.findInstance("controller", "nonexistent");
    expect(value).to.be.null;

    value = container.findModule("controller", "nonexistent");
  });

  it("allows explicitly registering factories", function() {
    let container = new Container();

    class PhotosController {
      isPhotosFactory = true;
    }

    container.registerFactory("controller", "photos", PhotosController);

    let controller = container.findInstance("controller", "photos");
    expect(controller.isPhotosFactory).to.be.true;

    let Factory = container.findFactory("controller", "photos");
    controller = new Factory();
    expect(controller.isPhotosFactory).to.be.true;

    // Verify cached case
    Factory = container.findFactory("controller", "photos");
    controller = new Factory();
    expect(controller.isPhotosFactory).to.be.true;
  });

  it("allows explicitly registering instances", function() {
    let container = new Container();

    class PhotosController {
      isPhotosFactory = true;
    }

    let ourController = new PhotosController();

    container.registerInstance("controller", "photos", ourController);

    let controller = container.findInstance("controller", "photos");
    expect(controller.isPhotosFactory).to.be.true;
    expect(controller).to.equal(ourController);

    expect(Container.metaFor(controller).name).to.equal("photos");
  });

  describe("when resolving modules", function() {
    it("finds unregistered modules via a resolver", function() {
      let resolver = {
        resolve([type, name]: [string, Key]): Resolution<any> {
          return [{ type, name }, "foo/bar"];
        },

        invalidateCache(_: string) { }
      };

      let container = new Container({
        resolver
      });

      expect(container.findModule("foo", "bar")).to.deep.equal({
        type: "foo",
        name: "bar"
      });
    });

    it("invalidates the module cache after being notified of a path change", function() {
      let count = 0;
      let resolver = {
        resolve([_type, _name]: [string, Key]): Resolution<any> {
          return [{ count: ++count }, "foo/bar.js"];
        },

        invalidateCache(path: string) {
          expect(path).to.equal("foo/bar.ts");
        }
      };

      let container = new Container({
        resolver
      });

      expect(container.findModule("foo", "bar")).to.deep.equal({
        count: 1
      });

      // Stays cached between calls
      expect(container.findModule("foo", "bar")).to.deep.equal({
        count: 1
      });

      // Note that we are invalidating `.ts` instead of `.js`—because require
      // hook load order is opaque, we have to assume that any file with the
      // same name but a different extension has invalidated the cache.
      container.fileDidChange("foo/bar.ts");

      // Cached value is cleared and count is incremented
      expect(container.findModule("foo", "bar")).to.deep.equal({
        count: 2
      });
    });

    it("does nothing if a changed file has not been seen before", function() {
      let container = new Container();

      container.fileDidChange("some/file.txt");
      expect(true).to.be.true;
    });

  });

  it("injects properties into specific objects", function() {
    let container = new Container();

    class PhotosController {
      isPhotosFactory = true;
    }

    class PostsController {
      isPostsController = true;
    }

    container.registerFactory("controller", "photos", PhotosController);
    container.registerFactory("controller", "posts", PostsController);

    container.inject(["controller", "photos"], {
      with: ["controller", "posts"],
      as: "posts"
    });

    let photosController = container.findInstance("controller", "photos");
    let postsController = container.findInstance("controller", "posts");
    expect(photosController.posts).to.equal(postsController);
    expect(photosController.constructor).to.equal(PhotosController);
    expect(photosController).to.be.an.instanceof(PhotosController);

    let Factory = container.findFactory("controller", "photos");
    photosController = new Factory();
    expect(photosController.posts).to.equal(postsController);
    expect(photosController.constructor).to.equal(PhotosController);
    expect(photosController).to.be.an.instanceof(PhotosController);
  });

  it("injects properties into types of objects", function() {
    let container = new Container();

    class PhotosController {
      isPhotosFactory = true;
    }

    class DBService {
      isDBService = true;
    }

    container.registerFactory("controller", "photos", PhotosController);
    container.registerFactory("service", "db", DBService);

    container.inject("controller", {
      with: ["service", "db"],
      as: "db",
      annotation: "inject-db-into-controllers"
    });

    let photosController = container.findInstance("controller", "photos");
    let dbService = container.findInstance("service", "db");
    expect(photosController.db).to.equal(dbService);
    expect(photosController.constructor).to.equal(PhotosController);
    expect(photosController).to.be.an.instanceof(PhotosController);

    let Factory = container.findFactory("controller", "photos");
    photosController = new Factory();
    expect(photosController.db).to.equal(dbService);
    expect(photosController.constructor).to.equal(PhotosController);
    expect(photosController).to.be.an.instanceof(PhotosController);
  });

  it("injects multiple properties", function() {
    let container = new Container();

    container.registerFactory("controller", "photos", class PhotosController {});
    container.registerFactory("service", "firstService", class FirstService {});
    container.registerFactory("service", "secondService", class SecondService {});

    container.inject("controller", {
      with: ["service", "firstService"],
      as: "firstService",
      annotation: "inject-firstService-into-controllers"
    });

    container.inject("controller", {
      with: ["service", "secondService"],
      as: "secondService",
      annotation: "inject-secondService-into-controllers"
    });

    let photosController = container.findInstance("controller", "photos");
    let firstService = container.findInstance("service", "firstService");
    let secondService = container.findInstance("service", "secondService");

    expect(photosController.firstService).to.equal(firstService);
    expect(photosController.secondService).to.equal(secondService);
  });

  describe("factory injections", function() {

    it("injects properties onto factories", function() {
      let container = new Container();

      container.registerFactory("controller", "photos", class PhotosController {});
      container.registerFactory("service", "firstService", class FirstService {});

      container.inject("controller", {
        with: ["service", "firstService"],
        as: "firstService",
        on: "factories",
        annotation: "inject-first-service-into-factories"
      });

      let controller = container.findFactory("controller", "photos");
      let firstService = container.findInstance("service", "firstService");

      expect(controller.firstService).to.equal(firstService);
    });

  });

  describe("containerFor", function() {
    it("retrieves the container from an instance", function() {
      let container = new Container();

      container.registerInstance("config", "someConfig", {});
      let config = container.findInstance("config", "someConfig");

      expect(Container.containerFor(config)).to.equal(container);
    });

    it("retrieves the container from a factory and an instantiated factory", function() {
      let container = new Container();

      container.registerFactory("controller", "photos", class PhotosController {});
      let Controller = container.findFactory("controller", "photos");

      expect(Container.containerFor(Controller)).to.equal(container);
      expect(Container.containerFor(new Controller())).to.equal(container);
    });
  });

  describe("nameFor", function() {
    it("retrieves the container name from an instance", function() {
      let container = new Container();

      container.registerInstance("config", "someConfig", {});
      let config = container.findInstance("config", "someConfig");

      expect(Container.nameFor(config)).to.equal("someConfig");
    });

    it("retrieves the container name from a factory and an instantiated factory", function() {
      let container = new Container();

      container.registerFactory("controller", "photos", class PhotosController {});
      let Controller = container.findFactory("controller", "photos");

      expect(Container.nameFor(Controller)).to.equal("photos");
      expect(Container.nameFor(new Controller())).to.equal("photos");
    });
  });
});
