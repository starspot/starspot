import { dasherize, underscore} from "inflected";
import { Reflector } from "starspot-core";
import JSONAPI from "./json-api";
import Resource from "./resource";
import { Result, ResourceResult, ResourcesResult } from "./results";

interface Attributes {
  [attr: string]: any;
}

class Serializer {
  isCollection: boolean;
  includedResources: Resource<any>[] = [];
  primaryResources: Resource<any>[] = [];

  serializeResults(results: Result[]) {
    this.processResults(results);

    let statusCode = results[0].statusCode;

    if (this.isCollection) {
      return {
        json: this.serializeMany(this.primaryResources),
        statusCode
      };
    } else {
      return {
        json: this.serialize(this.primaryResources[0]),
        statusCode
      };
    }
  }

  processResults(results: Result[]) {
    for (let result of results) {
      if (result instanceof ResourceResult) {
        this.processResource(result);
      } else if (result instanceof ResourcesResult) {
        this.processResources(result);
      }
    }
  }

  processResource(result: ResourceResult) {
    this.isCollection = false;
    this.primaryResources.push(result.resource);
  }

  processResources(result: ResourcesResult) {
    this.isCollection = true;
    this.primaryResources.push(...result.resources);
  }

  serialize(model: any): JSONAPI.DataDocument {
    let data = serializeModel(model);

    return { data };
  }

  serializeMany(models: any[]): JSONAPI.DataDocument {
    let data = models.map(m => serializeModel(m));

    return { data };
  }
}

function serializeModel(model: any): JSONAPI.ResourceObject  {
  let reflector = Reflector.get(model);
  let attributes: Attributes = {};

  if (!reflector) {
    throw new Error("Can't serialize a model without a reflector installed.");
  }

  for (let attribute of reflector.getAttributes(model)) {
    let attrValue = reflector.getAttribute(model, attribute);
    let attrName = dasherizeAttribute(attribute);
    attributes[attrName] = attrValue === undefined ? null : reflector.getAttribute(model, attribute);
  }

  return {
    id: reflector.getID(model)+"",
    type: reflector.getType(model),
    attributes: attributes
  };
}

function dasherizeAttribute(attribute: string): string {
  return dasherize(underscore(attribute));
}

export default Serializer;