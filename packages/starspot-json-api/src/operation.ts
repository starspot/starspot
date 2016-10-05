import Inflected = require("inflected");

import Resource from "./resource";
import ResourceSerializer from "./serializer";
import { Container } from "starspot-core";
import JSONAPI from "./index";

export interface OperationOptions {
  [key: string]: any;
  container?: Container;
}

export type ResourceFinder = typeof Resource;

abstract class Operation {
  constructor(options: OperationOptions) {
    Object.assign(this, options);
  }

  container: Container;
  resource?: Resource;
  resources?: Resource;

  abstract process(): void;
}

export default Operation;

export class GetResourcesOperation extends Operation {
  name: string;

  get Resource(): ResourceFinder {
    let name = Inflected.singularize(this.name);
    return this.container.findFactory("resource", name);
  }

  process(): JSONAPI.DataDocument {
    let serializer = new ResourceSerializer();
    let Resource = this.Resource;

    let resources = Resource.findAll().map(model => new Resource(model));

    return serializer.serializeMany(resources);
  }
}
