import { expect } from "chai";

import { metadataFor } from "../src/metadata";
import MetadataMap from "../src/metadata-map";


describe("metadataFor", function() {
  it("creates a metadata map for an object", function() {
    let target = {};
    let sym = Symbol();

    let metadata = metadataFor(target, sym);
    expect(metadataFor(target, sym)).to.equal(metadata);
    expect(metadata).to.be.an.instanceOf(MetadataMap);
  });

  it("is inherited across subclasses", function() {
    let sym = Symbol();

    class A { }
    class B extends A { }
    class C extends B { }

    metadataFor(A, sym).set("message", "hello world");
    expect(metadataFor(B, sym).get("message")).to.equal("hello world");
    expect(metadataFor(C, sym).get("message")).to.equal("hello world");
  });

  it("allows child classes to override a parent class", function() {
    let sym = Symbol();

    class A { }
    class B extends A { }
    class C extends B { }

    metadataFor(A, sym).set("message", "hello world");
    metadataFor(B, sym).set("message", "goodbye world");
    expect(metadataFor(A, sym).get("message")).to.equal("hello world");
    expect(metadataFor(B, sym).get("message")).to.equal("goodbye world");
    expect(metadataFor(C, sym).get("message")).to.equal("goodbye world");

    class A2 extends A { }
    expect(metadataFor(A2, sym).get("message")).to.equal("hello world");
  });

  it("is inherited across subclasses if the child class has metadata added first", function() {
    let sym = Symbol();

    class A { }
    class B extends A { }
    class C extends B { }

    let cMetadata = metadataFor(C, sym);
    expect(cMetadata.get("message")).to.be.undefined;

    metadataFor(A, sym).set("message", "hello world");

    expect(cMetadata.get("message")).to.equal("hello world");
    expect(metadataFor(B, sym).get("message")).to.equal("hello world");
  });

  it("can check for metadata without creating it", function() {
    let target = {};
    let sym = Symbol();

    expect(metadataFor(target, sym, false)).to.be.null;

    let metadata = metadataFor(target, sym, true);
    expect(metadata).to.be.an.instanceOf(MetadataMap);
    expect(metadataFor(target, sym, false)).to.equal(metadata);

    let otherSym = Symbol();
    expect(metadataFor(target, otherSym, false)).to.be.null;
  });
});