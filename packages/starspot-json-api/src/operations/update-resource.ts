import Operation from "../operation";
import { ResourceResult } from "../results";
import JSONAPI from "../json-api";
import { camelize, underscore } from "inflected";
import { AttributeNotUpdatableError } from "../exceptions";
import { Descriptors } from "../resource";

export default class UpdateResourceOperation extends Operation {
  attributes: JSONAPI.AttributesObject;
  type: string;
  id: string;

  async process() {
    if (!this.id) { throw new Error("You must provide an id when updating"); }

    let Resource = this.findResource();
    let model = await Resource.findByID(this.id);
    let resource = new Resource(model);
    let attributes = processAttributes(this.type, this.attributes, resource["@@fields"]);

    await resource.updateAttributes(attributes);
    await this.target.invokeCallback("update", model);

    let isValid = await resource.validate();

    return new ResourceResult(resource, isValid ? 200: 422);
  }
}

function processAttributes(type: string, attributes: JSONAPI.AttributesObject, descriptors: Descriptors): JSONAPI.AttributesObject {
  let processed = {};

  for (let key of Object.keys(attributes)) {
    let camelizedKey = camelize(underscore(key), false);

    if ((camelizedKey in descriptors) && descriptors[camelizedKey].updatable) {
      processed[camelizedKey] = attributes[key];
    } else {
      throw new AttributeNotUpdatableError(type, key);
    }
  }

  return processed;
}