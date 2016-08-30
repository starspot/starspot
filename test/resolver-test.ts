import { expect } from "chai";
import Resolver from "../src/resolver";

describe("Resolver", function() {

  it("allows explicitly registering factories", function() {
    let resolver = new Resolver();

    class PhotosController {
      isPhotosFactory = true;
    }

    resolver.registerFactory("controller", "photos", PhotosController);

    let controller = resolver.findInstance("controller", "photos");
    expect(controller.isPhotosFactory).to.be.true;

    let Factory = resolver.findFactory("controller", "photos");
    controller = new Factory();
    expect(controller.isPhotosFactory).to.be.true;
  });

  it("injects properties into specific objects", function() {
    let resolver = new Resolver();

    class PhotosController {
      isPhotosFactory = true;
    }

    class PostsController {
      isPostsController = true;
    }

    resolver.registerFactory("controller", "photos", PhotosController);
    resolver.registerFactory("controller", "posts", PostsController);

    resolver.inject(["controller", "photos"], {
      with: ["controller", "posts"],
      as: "posts"
    });

    let photosController = resolver.findInstance("controller", "photos");
    let postsController = resolver.findInstance("controller", "posts");
    expect(photosController.posts).to.equal(postsController);
    expect(photosController.constructor).to.equal(PhotosController);
    expect(photosController).to.be.an.instanceof(PhotosController);

    let Factory = resolver.findFactory("controller", "photos");
    photosController = new Factory();
    expect(photosController.posts).to.equal(postsController);
    expect(photosController.constructor).to.equal(PhotosController);
    expect(photosController).to.be.an.instanceof(PhotosController);
  });

  it("injects properties into types of objects", function() {
    let resolver = new Resolver();

    class PhotosController {
      isPhotosFactory = true;
    }

    class DBService {
      isDBService = true;
    }

    resolver.registerFactory("controller", "photos", PhotosController);
    resolver.registerFactory("service", "db", DBService);

    resolver.inject("controller", {
      with: ["service", "db"],
      as: "db",
      annotation: "inject-db-into-controllers"
    });

    let photosController = resolver.findInstance("controller", "photos");
    let dbService = resolver.findInstance("service", "db");
    expect(photosController.db).to.equal(dbService);
    expect(photosController.constructor).to.equal(PhotosController);
    expect(photosController).to.be.an.instanceof(PhotosController);

    let Factory = resolver.findFactory("controller", "photos");
    photosController = new Factory();
    expect(photosController.db).to.equal(dbService);
    expect(photosController.constructor).to.equal(PhotosController);
    expect(photosController).to.be.an.instanceof(PhotosController);
  });

});
