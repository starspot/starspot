import { expect } from "chai";
import {StaticReflector} from "../src/reflector";

describe("StaticReflector", function () {

  let model: any;
  let reflector: StaticReflector;

  beforeEach(function () {
    model = {
      id: "1234",
      alternateId: "asdf",
      foo: "bar",
      baz: "quux",
      secret: "attribute"
    };

    reflector = new StaticReflector({
      type: "test",
      attributes: ["foo", "baz"]
    });
  });

  it("can get a type", function () {
    expect(reflector.getType()).to.equal("test");
  });

  describe("getting an ID", function () {
    it("works with the default ID attribute", function () {
      expect(reflector.getID(model)).to.equal("1234");
    });

    it("works with a custom ID attribute", function () {
      reflector = new StaticReflector({
        type: "test",
        idAttribute: "alternateId",
        attributes: []
      });

      expect(reflector.getID(model)).to.equal("asdf");
    });
  });

  it("can get attributes", function () {
    expect(reflector.getAttributes()).to.deep.equal(["foo", "baz"]);
  });

  it("can get an attribute", function () {
    expect(reflector.getAttribute(model, "foo")).to.equal("bar");
  });

  it("can get relationships", function () {
    expect(reflector.getRelationships(model)).to.be.empty;
  });

  it("can get a relationship", function () {
    expect(reflector.getRelationship(model, "nonexistant")).to.be.null;
  });

  it("can validate", async function () {
    let ret = await reflector.validate(model);

    expect(ret).to.be.true;
  });
});
