import Resource from "./resource";
import ResourceSerializer from "./resource-serializer";
import JSONAPI from "./index";

abstract class Operation {
  resource?: Resource;
  resources?: Resource;

  abstract process(): void;
}

export default Operation;

export class GetResourcesOperation extends Operation {
  resource: Resource;

  constructor(resource: Resource) {
    super();
    this.resource = resource;
  }

  process(): JSONAPI.DataDocument {
    let resources = this.resource._findAll();
    let serializer = new ResourceSerializer();

    return {
      data: resources.map(r => serializer.serializeResource(r))
    };
  }
}