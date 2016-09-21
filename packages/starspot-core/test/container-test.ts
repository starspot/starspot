import { expect } from "chai";
import fixture from "./helpers/fixture";

import Container from "../src/container";

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
});
