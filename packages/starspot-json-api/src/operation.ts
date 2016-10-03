import Resource from "./resource";
import JSONAPI from "./index";

abstract class Operation {
  resource?: Resource;
  resources?: Resource;

  abstract process(): void;
}

export default Operation;

export class ResourcesOperation extends Operation {
  resource: Resource;

  constructor(resource: Resource) {
    super();
    this.resource = resource;
  }

  process(): JSONAPI.DataDocument {
    let resource = this.resource;
    let resources = resource.findAll();

    let serializedResources = resources.map(r => {
      return {
        id: r.id,
        type: r.type
      };
    });

    return {
      data: serializedResources
    };
  }
}