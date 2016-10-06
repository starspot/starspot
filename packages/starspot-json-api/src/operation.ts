import Inflected = require("inflected");

import Resource from "./resource";
import { Container } from "starspot-core";

export interface OperationOptions {
  [key: string]: any;
  container?: Container;
}

export type ResourceClass = typeof Resource;

abstract class Operation {
  constructor(options: OperationOptions) {
    Object.assign(this, options);
  }

  container: Container;
  resource?: Resource;
  resources?: Resource;

  abstract process(): void;

  protected findResource(name: string): ResourceClass {
    name = Inflected.singularize(name);
    return this.container.findFactory("resource", name);
  }
}

export default Operation;