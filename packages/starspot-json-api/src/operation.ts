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

  resourceName: string;
  resource?: Resource<any>;
  resources?: Resource<any>;

  abstract async process(): Promise<any>;

  protected findResource(): ResourceClass {
    let name = Inflected.singularize(this.resourceName);
    return this.container.findFactory("resource", name);
  }
}

export default Operation;