import Operation from "../operation";
import { ResourceResult } from "../results";
import JSONAPI from "../json-api";

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

    this.target.invokeCallback("create", model);

    let resource = new Resource(model);
    let isValid = await resource.validate();

    return new ResourceResult(resource, isValid ? 201: 422);
  }
}