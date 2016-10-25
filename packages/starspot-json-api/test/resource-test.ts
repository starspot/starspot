import { expect } from "chai";
import Resource, {
  attributes,
  attribute,
  writable,
  readOnly
} from "../src/resource";

describe("Resource", function() {

  describe("attributes", function() {

    it("inherits through subclasses", function() {
      @attributes("a1", "a2")
      class A extends Resource<any> {
        @attribute
        a3: string;
      }

      @attributes("b1", "b2")
      class B extends A {
        @attribute
        b3: string;
      }

      @attributes("c1", "c2")
      class C extends B {
        @attribute
        c3: string
      }

      let resource = new C();
      expect(resource["_attributesList"].sort()).to.deep.equal([
        "a1", "a2", "a3", "b1", "b2", "b3", "c1", "c2", "c3"
      ]);

    });

    it("can be overwritten by subclasses", function() {
      class A extends Resource<any> {
        @attribute
        a1: string
      }

      class B extends A {
        @writable
        a1: string
      }

      class C extends B {
        @readOnly
        a1: string;
      }

      let b = new B();
      let c = new C();

      expect(b["@@fields"]["a1"].writable).to.be.true;
      expect(c["@@fields"]["a1"].writable).to.be.false;
    });

  });

});