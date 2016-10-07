import Operation from "../operation";
import { ResourcesResult } from "../results";

export default class GetResourcesOperation extends Operation {
  name: string;

  async process() {
    let Resource = this.findResource();

    let models = await Resource.findAll()
    let resources = models.map(model => new Resource(model));

    return new ResourcesResult(resources);
  }
}
