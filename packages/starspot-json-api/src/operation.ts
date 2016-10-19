import Inflected = require("inflected");

import Resource from "./resource";
import { Container } from "starspot-core";

export interface CallbackTarget {
  invokeCallback(name: string, ...args: any[]): void;
}

export interface OperationOptions {
  [key: string]: any;
  container?: Container;
  target?: CallbackTarget;
}

export interface ResourceFactory {
  new (): Resource<any>;
}

abstract class Operation {
  constructor(options: OperationOptions) {
    Object.assign(this, options);
  }

  container: Container;
  target: CallbackTarget;

  type: string;
  resource?: Resource<any>;
  resources?: Resource<any>;

  abstract async process(): Promise<any>;

  protected findResource(): ResourceFactory & typeof Resource {
    let name = Inflected.singularize(this.type);
    return this.container.findFactory("resource", name);
  }
}

export default Operation;