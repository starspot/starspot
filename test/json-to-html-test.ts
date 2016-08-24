import { expect } from "chai";
import { jsonToHTML } from "../src/util/json-to-html";

describe("JSON to HTML serialization", function() {

  it("serializes an empty object", function() {
    let json = {};
    expect(jsonToHTML(json)).to.equal(`<span class="dictionary"><span class="control bracket curly opening">{</span><span class="control bracket curly closing">}</span></span>`);
  });

  it("serializes string properties", function() {
    let json = {
      hello: "World"
    };

    expect(jsonToHTML(json)).to.equal(`<span class="dictionary"><span class="control bracket curly opening">{</span>
<span class="control tab">  </span><span class="key-hello"><span class="string key"><span class="control quote opening">"</span><span class="text">hello</span><span class="control quote closing">"</span></span><span class="control colon">:</span> <span class="string"><span class="control quote opening">"</span><span class="text">World</span><span class="control quote closing">"</span></span></span>
<span class="control tab"></span><span class="control bracket curly closing">}</span></span>`);
  });

  it("serializes strings with newlines", function() {
    let json = {
      message: "Hello\nWorld"
    };

    expect(jsonToHTML(json)).to.equal(`<span class="dictionary"><span class="control bracket curly opening">{</span>
<span class="control tab">  </span><span class="key-message"><span class="string key"><span class="control quote opening">"</span><span class="text">message</span><span class="control quote closing">"</span></span><span class="control colon">:</span> <span class="string"><span class="control quote opening">"</span><span class="text">Hello\\nWorld</span><span class="control quote closing">"</span></span></span>
<span class="control tab"></span><span class="control bracket curly closing">}</span></span>`);
  });

  it("serializes numbers", function() {
    let json = {
      hello: 12345
    };

    expect(jsonToHTML(json)).to.equal(`<span class="dictionary"><span class="control bracket curly opening">{</span>
<span class="control tab">  </span><span class="key-hello"><span class="string key"><span class="control quote opening">"</span><span class="text">hello</span><span class="control quote closing">"</span></span><span class="control colon">:</span> <span class="number">12345</span></span>
<span class="control tab"></span><span class="control bracket curly closing">}</span></span>`);
  });

  it("serializes booleans", function() {
    let json = {
      hello: true,
      world: false
    };

    expect(jsonToHTML(json)).to.equal(`<span class="dictionary"><span class="control bracket curly opening">{</span>
<span class="control tab">  </span><span class="key-hello"><span class="string key"><span class="control quote opening">"</span><span class="text">hello</span><span class="control quote closing">"</span></span><span class="control colon">:</span> <span class="boolean true">true</span></span><span class="control comma">,</span>
<span class="control tab">  </span><span class="key-world"><span class="string key"><span class="control quote opening">"</span><span class="text">world</span><span class="control quote closing">"</span></span><span class="control colon">:</span> <span class="boolean false">false</span></span>
<span class="control tab"></span><span class="control bracket curly closing">}</span></span>`);
  });

  it("serializes null values", function() {
    let json = {
      hello: null as any
    };

    expect(jsonToHTML(json)).to.equal(`<span class="dictionary"><span class="control bracket curly opening">{</span>
<span class="control tab">  </span><span class="key-hello"><span class="string key"><span class="control quote opening">"</span><span class="text">hello</span><span class="control quote closing">"</span></span><span class="control colon">:</span> <span class="null">null</span></span>
<span class="control tab"></span><span class="control bracket curly closing">}</span></span>`);
  });

  it("serializes empty arrays", function() {
    let json = {
      hello: [] as any[]
    };

    expect(jsonToHTML(json)).to.equal(`<span class="dictionary"><span class="control bracket curly opening">{</span>
<span class="control tab">  </span><span class="key-hello"><span class="string key"><span class="control quote opening">"</span><span class="text">hello</span><span class="control quote closing">"</span></span><span class="control colon">:</span> <span class="array"><span class="control bracket square opening">[</span><span class="control bracket square closing">]</span></span></span>
<span class="control tab"></span><span class="control bracket curly closing">}</span></span>`);
  });

  it("serializes arrays", function() {
    let json = {
      hello: [123, "world"]
    };

    expect(jsonToHTML(json)).to.equal(`<span class="dictionary"><span class="control bracket curly opening">{</span>
<span class="control tab">  </span><span class="key-hello"><span class="string key"><span class="control quote opening">"</span><span class="text">hello</span><span class="control quote closing">"</span></span><span class="control colon">:</span> <span class="array"><span class="control bracket square opening">[</span>
<span class="control tab">    </span><span class="number">123</span><span class="control comma">,</span>
<span class="control tab">    </span><span class="string"><span class="control quote opening">"</span><span class="text">world</span><span class="control quote closing">"</span></span>
<span class="control tab">  </span><span class="control bracket square closing">]</span></span></span>
<span class="control tab"></span><span class="control bracket curly closing">}</span></span>`);
  });

  it("serializes nested objects", function() {
    let json = {
      Hello: {
        world: {
          message: "hey"
        }
      }
    };

    expect(jsonToHTML(json)).to.equal(`<span class="dictionary"><span class="control bracket curly opening">{</span>
<span class="control tab">  </span><span class="key-Hello"><span class="string key"><span class="control quote opening">"</span><span class="text">Hello</span><span class="control quote closing">"</span></span><span class="control colon">:</span> <span class="dictionary"><span class="control bracket curly opening">{</span>
<span class="control tab">    </span><span class="key-world"><span class="string key"><span class="control quote opening">"</span><span class="text">world</span><span class="control quote closing">"</span></span><span class="control colon">:</span> <span class="dictionary"><span class="control bracket curly opening">{</span>
<span class="control tab">      </span><span class="key-message"><span class="string key"><span class="control quote opening">"</span><span class="text">message</span><span class="control quote closing">"</span></span><span class="control colon">:</span> <span class="string"><span class="control quote opening">"</span><span class="text">hey</span><span class="control quote closing">"</span></span></span>
<span class="control tab">    </span><span class="control bracket curly closing">}</span></span></span>
<span class="control tab">  </span><span class="control bracket curly closing">}</span></span></span>
<span class="control tab"></span><span class="control bracket curly closing">}</span></span>`);
  });
});