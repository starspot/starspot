import Operation from "../operation";
import { ResourceResult } from "../results";
import JSONAPI from "../index";

export default class CreateResourceOperation extends Operation {
  attributes: JSONAPI.AttributesObject;
  type: string;
  id: string;

  async process() {
    if (this.id !== undefined) {
      throw new Error("TODO: Support client IDs");
    }

    let Resource = this.findResource();
    let model = await Resource.create({
      attributes: this.attributes
    });

    let resource = new Resource(model);

    return new ResourceResult(resource, 201);
  }
}