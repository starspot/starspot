import { expect } from "chai";
import MetadataMap from "../src/metadata-map";
import DescriptorMetadataMap from "../src/descriptor-map";
import ArrayMetadataMap from "../src/array-metadata-map";

type Key = string | symbol;

describe("MetadataMap", function() {
  let symKey = Symbol("@@symKey");
  let strKey = "@@strKey";

  let symKey2 = Symbol("@@symKey2");
  let strKey2 = "@@strKey2";

  describe("without a parent", function() {
    let metadata: MetadataMap<Key, any>;
   
    beforeEach(function() {
      metadata = new MetadataMap<Key, any>();
    });

    it("can set and get values", function() {
      metadata.set(symKey, "foo");
      metadata.set(strKey, "bar");

      expect(metadata.get(symKey)).to.equal("foo");
      expect(metadata.get(strKey)).to.equal("bar");
    });

    it("can check for existence", function() {
      metadata.set(symKey, "foo");
      metadata.set(strKey, "bar");

      expect(metadata.has(symKey)).to.be.true;
      expect(metadata.has(strKey)).to.be.true;
      expect(metadata.has("notFound")).to.be.false;

      expect(metadata.hasOwn(symKey)).to.be.true;
      expect(metadata.hasOwn(strKey)).to.be.true;
      expect(metadata.hasOwn("notFound")).to.be.false;
    });

    it("can enumerate its keys", function() {
      metadata.set(symKey, "baz");
      metadata.set(strKey, "quux");
     
      let count = 0;
      let keys = [];

      for (let key of metadata.keys()) {
        count++;
        keys.push(key)
      }

      expect(count).to.equal(2);
      expect(keys).to.deep.equal([symKey, strKey]);
    });

    it("can enumerate its own keys", function() {
      metadata.set(symKey, "baz");
      metadata.set(strKey, "quux");
     
      let count = 0;
      let keys = [];

      for (let key of metadata.ownKeys()) {
        count++;
        keys.push(key)
      }

      expect(count).to.equal(2);
      expect(keys).to.deep.equal([symKey, strKey]);
    });

    it("can enumerate all entries", function() {
      metadata.set(symKey, "foo");
      metadata.set(strKey, "bar");
      metadata.set(symKey2, "baz");
      metadata.set(strKey2, "quux");

      let keys = [];
      let values = [];

      for (let [key, value] of metadata.entries()) {
        keys.push(key);
        values.push(value);
      }

      expect(keys).to.deep.equal([symKey, strKey, symKey2, strKey2]);
      expect(values).to.deep.equal(["foo", "bar", "baz", "quux"]);
    });

    it("can enumerate its own entries", function() {
      metadata.set(symKey, "foo");
      metadata.set(strKey, "bar");
      metadata.set(symKey2, "baz");
      metadata.set(strKey2, "quux");

      let keys = [];
      let values = [];

      for (let [key, value] of metadata.ownEntries()) {
        keys.push(key);
        values.push(value);
      }

      expect(keys).to.deep.equal([symKey, strKey, symKey2, strKey2]);
      expect(values).to.deep.equal(["foo", "bar", "baz", "quux"]);
    });
  });

  describe("single level", function() {
    let parent: MetadataMap<Key, any>;
    let metadata: MetadataMap<Key, any>;
    
    beforeEach(function() {
      parent = new MetadataMap<Key, any>();
      metadata = new MetadataMap(parent);
    });

    it("can get and set values", function() {
      parent.set(symKey, "foo");
      parent.set(strKey, "bar");
      parent.set(symKey2, "FOO");
      parent.set(strKey2, "BAR");

      metadata.set(symKey2, "baz");
      metadata.set(strKey2, "quux");

      expect(metadata.get(symKey)).to.equal("foo");
      expect(metadata.get(strKey)).to.equal("bar");
      expect(metadata.get(symKey2)).to.equal("baz");
      expect(metadata.get(strKey2)).to.equal("quux");
    });

    it("can check for existence", function() {
      parent.set(symKey, "foo");
      parent.set(strKey, "bar");
      parent.set(symKey2, "FOO");
      parent.set(strKey2, "BAR");

      metadata.set(symKey2, "baz");
      metadata.set(strKey2, "quux");

      expect(metadata.has(symKey)).to.be.true;
      expect(metadata.has(strKey)).to.be.true;
      expect(metadata.has("notFound")).to.be.false;
      expect(metadata.has(symKey2)).to.be.true;
      expect(metadata.has(strKey2)).to.be.true;

      expect(metadata.hasOwn(symKey)).to.be.false;
      expect(metadata.hasOwn(strKey)).to.be.false;
      expect(metadata.hasOwn("notFound")).to.be.false;
      expect(metadata.hasOwn(symKey2)).to.be.true;
      expect(metadata.hasOwn(strKey2)).to.be.true;
    });

    it("can enumerate its own keys", function() {
      parent.set(symKey, "foo");
      parent.set(strKey, "bar");
      metadata.set(symKey2, "baz");
      metadata.set(strKey2, "quux");
     
      let count = 0;
      let keys = [];

      for (let key of metadata.ownKeys()) {
        count++;
        keys.push(key)
      }

      expect(count).to.equal(2);
      expect(keys).to.deep.equal([symKey2, strKey2]);
    });

    it("can enumerate all keys", function() {
      parent.set(symKey, "foo");
      parent.set(strKey, "bar");
      metadata.set(symKey2, "baz");
      metadata.set(strKey2, "quux");
     
      let count = 0;
      let keys = [];

      for (let key of metadata.keys()) {
        count++;
        keys.push(key)
      }

      expect(count).to.equal(4);
      expect(keys).to.deep.equal([symKey, strKey, symKey2, strKey2]);
    });

    it("can enumerate all entries", function() {
      parent.set(symKey, "foo");
      parent.set(strKey, "bar");
      parent.set(symKey2, "baz");
      parent.set(strKey2, "quux");
      metadata.set(symKey2, "bang");
      metadata.set(strKey2, "blat");

      let keys = [];
      let values = [];

      for (let [key, value] of metadata.entries()) {
        keys.push(key);
        values.push(value);
      }

      expect(keys).to.deep.equal([symKey, strKey, symKey2, strKey2]);
      expect(values).to.deep.equal(["foo", "bar", "bang", "blat"]);
    });

  });
});

describe("ArrayMetadataMap", function() {
  let symKey = Symbol("@@symKey");
  let strKey = "@@strKey";
  let symKey2 = Symbol("@@symKey2");
  let strKey2 = "@@strKey2";

  let parent: ArrayMetadataMap<Key, number>;
  let metadata: ArrayMetadataMap<Key, number>;
  
  beforeEach(function() {
    parent = new ArrayMetadataMap<Key, number>();
    metadata = new ArrayMetadataMap(parent);
  });

  it("returns an empty array if no array exists", function() {
    let arr = metadata.getArray(symKey);
    expect(arr).to.deep.equal([]);
    expect(metadata.getArray(symKey)).to.equal(arr);

    arr = metadata.getArray(strKey);
    expect(arr).to.deep.equal([]);
    expect(metadata.getArray(strKey)).to.equal(arr);
  });

  it("throws if an existing value is not an array", function() {
    metadata.set(symKey, {} as any);
    expect(() => metadata.getArray(symKey)).to.throw(Error);

    metadata.set(strKey, {} as any);
    expect(() => metadata.getArray(strKey)).to.throw(Error);
  });

  it("clones arrays that belong to a parent", function() {
    parent.set(symKey, [1, 2, 3]);
    parent.set(strKey, [1, 2, 3]);

    metadata.set(symKey2, [4, 5, 6]);
    metadata.set(strKey2, [4, 5, 6]);

    expect(metadata.getArray(symKey)).to.deep.equal([1, 2, 3]);
    expect(metadata.getArray(symKey)).to.not.equal(parent.getArray(symKey));
    expect(metadata.getArray(strKey)).to.deep.equal([1, 2, 3]);
    expect(metadata.getArray(strKey)).to.not.equal(parent.getArray(strKey));

    metadata.getArray(symKey).push(4, 5, 6);
    expect(metadata.getArray(symKey)).to.deep.equal([1, 2, 3, 4, 5, 6]);
    expect(parent.getArray(symKey)).to.deep.equal([1, 2, 3]);
    metadata.getArray(strKey).push(4, 5, 6);
    expect(metadata.getArray(strKey)).to.deep.equal([1, 2, 3, 4, 5, 6]);
    expect(parent.getArray(strKey)).to.deep.equal([1, 2, 3]);
  });

  it("throws if a parent's existing value is not an array", function() {
    parent.set(symKey, {} as any);
    expect(() => metadata.getArray(symKey)).to.throw(Error);

    parent.set(strKey, {} as any);
    expect(() => metadata.getArray(strKey)).to.throw(Error);
  });
});

describe("DescriptorMetadataMap", function() {
  let symKey = Symbol("@@symKey");
  let strKey = "@@strKey";

  let parent: DescriptorMetadataMap<Key, Descriptor>;
  let metadata: DescriptorMetadataMap<Key, Descriptor>;

  class Descriptor {
    foo: string;

    constructor(options?: any) {
      if (options) {
        Object.assign(this, options);
      }
    }

    clone() {
      return new Descriptor(this);
    }
  }
  
  beforeEach(function() {
    parent = new DescriptorMetadataMap<Key, Descriptor>();
    metadata = new DescriptorMetadataMap(parent);
  });

  it("returns null if no descriptor is found", function() {
    expect(metadata.get(symKey)).to.be.null;
    expect(metadata.get(strKey)).to.be.null;
  });

  it("returns original descriptor if set on child", function() {
    let desc = new Descriptor({ foo: "bar" });

    metadata.set(symKey, desc);
    expect(metadata.get(symKey)).to.equal(desc);
    metadata.set(strKey, desc);
    expect(metadata.get(strKey)).to.equal(desc);
  });

  it("returns a cloned descriptor if set on parent", function() {
    let desc = new Descriptor({ foo: "bar" });

    parent.set(symKey, desc);
    expect(metadata.get(symKey).foo).to.equal("bar");
    expect(metadata.get(symKey)).to.not.equal(desc);
    metadata.get(symKey).foo = "baz";
    expect(desc.foo).to.equal("bar");

    parent.set(strKey, desc);
    expect(metadata.get(strKey).foo).to.equal("bar");
    expect(metadata.get(strKey)).to.not.equal(desc);
    metadata.get(strKey).foo = "baz";
    expect(desc.foo).to.equal("bar");
  });

  it("throws if existing value is not cloneable", function() {
    metadata.set(symKey, {} as any);
    expect(() => metadata.get(symKey)).to.throw(Error);

    metadata.set(strKey, {} as any);
    expect(() => metadata.get(strKey)).to.throw(Error);
  });

  it("throws if parent value is not cloneable", function() {
    parent.set(symKey, {} as any);
    expect(() => metadata.get(symKey)).to.throw(Error);

    parent.set(strKey, {} as any);
    expect(() => metadata.get(strKey)).to.throw(Error);
  });
});