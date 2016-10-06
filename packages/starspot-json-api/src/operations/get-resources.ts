import JSONAPI from "../index";
import Operation from "../operation";
import Serializer from "../serializer";

export default class GetResourcesOperation extends Operation {
  name: string;

  process(): JSONAPI.DataDocument {
    let serializer = new Serializer();
    let Resource = this.findResource(this.name);

    // let resources = Resource.findAll().map(model => new Resource(model));
    let resources = Resource.findAll();
    return serializer.serializeMany(resources);
  }
}
