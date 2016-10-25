import { dasherize, underscore, pluralize, singularize } from "inflected";
import { Reflector, Container } from "starspot-core";
import JSONAPI from "./json-api";
import Resource from "./resource";
import { Result, ResourceResult, ResourcesResult } from "./results";

class Serializer {
  isCollection: boolean;
  includedResources: Resource<any>[] = [];
  primaryResources: Resource<any>[] = [];
  container: Container;

  async serializeResults(results: Result[]) {
    this.processResults(results);

    let statusCode = results[0].statusCode;
    let json: JSONAPI.DataDocument;

    let includedModels = new Included();
    let included: JSONAPI.ResourceObject[] = [];

    if (this.isCollection) {
      json = await this.serializeMany(this.primaryResources, includedModels);
    } else {
      json = await this.serialize(this.primaryResources[0], includedModels);
    }

    let batch = includedModels.getIncluded();
    while (batch.length > 0) {
      includedModels.reset();

      for (let i = 0; i < batch.length; i++) {
        let model = batch[i];
        let type = singularize(Reflector.get(model).getType(model));

        let ResourceFactory = this.container.findFactory("resource", type);
        if (!ResourceFactory) {
          throw new Error("Cannot find Resource class for " + type);
        }
        let resource = new ResourceFactory(model);
        included.push(await serializeModel(resource, includedModels));
      }

      batch = includedModels.getIncluded();
    }

    if (included.length > 0) {
      json.included = included;
    }

    return { json, statusCode }
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

  async serialize(model: any, included: Included): Promise<JSONAPI.DataDocument> {
    return { data: await serializeModel(model, included) };
  }

  async serializeMany(models: any[], included: Included): Promise<JSONAPI.DataDocument> {
    let data: JSONAPI.PrimaryData = [];

    for (let i = 0; i < models.length; i++) {
      let model = models[i];
      data.push(await serializeModel(model, included));
    }

    return { data };
  }
}

export class Included {
  seen: Map<string, Map<string, any>> = new Map();
  toInclude: any[] = [];

  getIncluded() {
    return this.toInclude.slice();
  }

  add(model: any) {
    let reflector = Reflector.get(model);
    let type = reflector.getType(model);
    let id = reflector.getID(model);

    let idMap = this.seen.get(type);

    if (!idMap) {
      idMap = new Map<string, any>();
      this.seen.set(type, idMap);
    }

    if (!idMap.get(id)) {
      idMap.set(id, true);
      this.toInclude.push(model);
    }
  }

  reset() {
    this.toInclude = [];
  }
}

async function serializeModel(model: any, included: Included): Promise<JSONAPI.ResourceObject>  {
  let reflector = Reflector.get(model);

  if (!reflector) {
    throw new Error("Can't serialize a model without a reflector installed.");
  }

  let payload: JSONAPI.PrimaryData = {
    id: reflector.getID(model) + "",
    type: reflector.getType(model)
  };

  let attributes = reflector.getAttributes(model);
  if (attributes && attributes.length) {
    let serializedAttributes = {};

    for (let attribute of attributes) {
      let attrValue = reflector.getAttribute(model, attribute);
      let attrName = dasherizeAttribute(attribute);
      serializedAttributes[attrName] = attrValue === undefined ? null : reflector.getAttribute(model, attribute);
    }

    payload.attributes = serializedAttributes;
  }

  let relationships = reflector.getRelationships(model);
  if (relationships && relationships.length > 0) {
    let serializedRelationships = {};

    for (let relationship of relationships) {
      let relationshipName = dasherizeAttribute(relationship);
      let relationshipValue = reflector.getRelationship(model, relationship);
      if (relationshipValue instanceof Reflector.HasOneRelationship) {
        if (relationshipValue.id !== null) {
          serializedRelationships[relationshipName] = serializeRelationship(relationshipValue);
          included.add(await relationshipValue.value);
        } else {
          serializedRelationships[relationshipName] = { data: null };
        }
      }
    }

    payload.relationships = serializedRelationships;
  }

  return payload;
}

function serializeRelationship(relationship: Reflector.Relationship) {
  let data = null;

  if (relationship instanceof Reflector.HasOneRelationship) {
    let { id, type } = relationship;
    id = id + "";

    if (id) {
      type = pluralize(type);
      data = { id, type };
    }
  }

  return {
    data
  }
}

function dasherizeAttribute(attribute: string): string {
  return dasherize(underscore(attribute));
}

export default Serializer;