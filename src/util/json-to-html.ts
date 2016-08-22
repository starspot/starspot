import escapeHTML from "./escape-html";

function wrapInDocument(content: string) {
  return `<html>
  <head>
    <style>
      body {
        background-color: #002b36;
      }

      main {
        font: 16px Menlo, Monaco, monospace;
      }

      pre {
        margin: 0;
        font: inherit;
        padding: 16px;
        line-height: 1.4em;
      }

      .json {
        color: #93a1a1;
      }

      .json .control {
        color: #586e75;
      }

      .json a {
        color: inherit;
        text-decoration:  none;
      }

      .json a span.text {
        border-bottom: 2px solid #F1F3F6;
      }

      .json .key {
        color: #268bd2;
        font-weight: bold;
      }

      .json > .dictionary > .key-content .key {
        color: #214373;
      }

      .json > .dictionary > .key-content .string,
      .json > .dictionary > .key-title .string,
      .json > .dictionary > .key-summary .string,
      .json > .dictionary > .key-id .string {
        color: #496281;
      }

      .json > .dictionary > .key-content .number,
      .json > .dictionary > .key-title .number,
      .json > .dictionary > .key-summary .number,
      .json > .dictionary > .key-id .number {
        color: #13BAA6;
      }

      .json > .dictionary > .key-content .null,
      .json > .dictionary > .key-content .boolean,
      .json > .dictionary > .key-content .number,
      .json > .dictionary > .key-title .null,
      .json > .dictionary > .key-title .boolean,
      .json > .dictionary > .key-title .number,
      .json > .dictionary > .key-summary .null,
      .json > .dictionary > .key-summary .boolean,
      .json > .dictionary > .key-summary .number,
      .json > .dictionary > .key-id .null,
      .json > .dictionary > .key-id .boolean,
      .json > .dictionary > .key-id .number {
        color: #FF416C;
      }

      .json > .dictionary > .key-content > .key,
      .json > .dictionary > .key-title > .key,
      .json > .dictionary > .key-summary > .key,
      .json > .dictionary > .key-id > .key {
        color: #0070FF;
      }
    </style>
  </head>
  <body>
    <main>
      <pre class="json">
${content}
      </pre>
    </main>
  </body>
</html>`;
}
export interface Dict {
  [key: string]: any;
}

class JSONHTMLSerializer {
  private indent = 0;
  private sortKeys = true;
  private _tab = "  ";
  private valueLimit = Infinity;
  private valueOmission = "…";
  private arrayLimit = Infinity;
  private _arrayOmission = "…";
  private classNamePrefix = "";

  constructor(private json: Dict) {
  }

  toHTML(): string {
    if (this.json == null) { return ""; };

    return this.node(this.json);
  }

  node(json: any): string {
    switch (typeof json) {
      case "string":
        return this.string(json as string);
      case "number":
        return this.span(json, "number");
      case "boolean":
        return this.span(json, json ? "boolean true" : "boolean false");
      case "object":
        if (json === null) { return this.span("null", "null"); }
        if (Array.isArray(json)) { return this.array(json); }

        return this.hash(json);
      default:
        throw new Error("Unsupported data type: " + String(json));
    }
  }

  span(content: string, classNames: string = "") {
    let classNamePrefix = this.classNamePrefix;

    if (classNamePrefix) {
      classNames = classNames
        .split(" ")
        .map(c => `${classNamePrefix}${c}`)
        .join(" ");
    }

    if (classNames) {
      classNames = ` class="${classNames}"`;
    }

    return `<span${classNames}>${content}</span>`;
  }

  arrayOmission() {
    return this.span(this._arrayOmission, "omission array");
  }

  array(object: any[]): string {
    if (!object.length) {
      return this.span(this.openingSquare() + this.closingSquare(), "array");
    }

    this.indent += 1;

    let result = this.openingSquare() + "\n";
    let array = object;

    if (object.length > this.arrayLimit) {
      array = array.slice(0, this.arrayLimit);
    }

    let rows = array.map(v => this.tab() + this.node(v));

    if (object.length > this.arrayLimit) {
      rows.push(this.tab() + this.arrayOmission());
    }

    result += rows.join(this.comma() + "\n");

    this.indent -= 1;
    result += "\n" + this.tab() + this.closingSquare();

    return this.span(result, "array");
  }

  string(str: string): string {
    return this.span(this.text(str, true), "string");
  }

  truncate(str: string) {
    let valueLimit = this.valueLimit;

    if (valueLimit === Infinity) { return str; }
    if (str.length <= valueLimit) { return str; }

    let stop = this.valueLimit - this.valueOmission.length;
    return str.substr(0, stop) + this.span(this.valueOmission, "omission");
  }

  text(value: any, shouldTruncate = false): string {
    value = JSON.stringify(value);
    value = value.replace(/^"/, "").replace(/"$/, "");
    value = escapeHTML(value);

    if (shouldTruncate) {
      value = this.truncate(value);
    }

    return this.openingQuote() + this.span(value, "text") + this.closingQuote();
  }

  hash(json: Dict): string {
    if (isEmpty(json)) {
      return this.span(this.openingCurly() + this.closingCurly(), "dictionary");
    }

    this.indent += 1;

    let result = this.openingCurly() + "\n";
    let keys = Object.keys(json);

    if (this.sortKeys) {
      keys.sort();
    }

    let rows = keys.map(key => {
      let value = json[key];
      let row = `${this.span(this.text(key), "string key") + this.colon()} ${this.node(value)}`;
      return this.tab() + this.span(row, `key-${key}`);
    });

    result += rows.join(this.comma() + "\n");
    this.indent -= 1;

    result += "\n" + this.tab() + this.closingCurly();
    return this.span(result, "dictionary");
  }

  tab(): string {
    return this.span(this._tab.repeat(this.indent), "control tab");
  }

  colon(): string {
    return this.span(":", "control colon");
  }

  comma(): string {
    return this.span(",", "control comma");
  }

  openingQuote(): string {
    return this.span('"', "control quote opening");
  }

  closingQuote() {
    return this.span('"', "control quote closing");
  }

  openingSquare() {
    return this.span("[", "control bracket square opening");
  }

  closingSquare() {
    return this.span("]", "control bracket square closing");
  }

  openingCurly(): string {
    return this.span("{", "control bracket curly opening");
  }

  closingCurly(): string {
    return this.span("}", "control bracket curly closing");
  }

}

function isEmpty(object: any): boolean {
  return Object.keys(object).length === 0;
}

export default function jsonToHTML(json: Dict) {
  return wrapInDocument(new JSONHTMLSerializer(json).toHTML());
}