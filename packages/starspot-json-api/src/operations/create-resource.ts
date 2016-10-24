import { camelize, underscore } from "inflected";
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
    let model = await (new Resource()).create({
      attributes: camelizeKeys(this.attributes)
    });

    await this.target.invokeCallback("create", model);

    let resource = new Resource(model);
    let isValid = await resource.validate();

    return new ResourceResult(resource, isValid ? 201: 422);
  }
}

function camelizeKeys(obj: any): JSONAPI.AttributesObject {
  let camelized = {};

  for (let attr of Object.keys(obj)) {
    camelized[camelize(underscore(attr), false)] = obj[attr];
  }

  return camelized;
}