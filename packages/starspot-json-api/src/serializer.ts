import JSONAPI from "./index";

interface Attributes {
  [attr: string]: any;
}

class Serializer {
  serialize(model: Serializer.Serializable): JSONAPI.Document {
    let data = serializeModel(model);

    return { data };
  }

  serializeMany(models: Serializer.Serializable[]): JSONAPI.Document {
    let data = models.map(m => serializeModel(m));

    return { data };
  }

  canSerialize(model: Serializer.Serializable): boolean {
    return !!protocolFor(model);
  }
}

function serializeModel(model: Serializer.Serializable): JSONAPI.ResourceObject  {
  let protocol = protocolFor(model);
  let attributes: Attributes = {};

  for (let attribute of protocol.getAttributes(model)) {
    let attrValue = protocol.getAttribute(model, attribute);
    attributes[attribute] = attrValue === undefined ? null : protocol.getAttribute(model, attribute);
  }

  return {
    id: protocol.getID(model),
    type: protocol.getType(model),
    attributes: attributes
  };
}

function protocolFor(obj: any) {
  return obj["@@SerializerProtocol"];
}

namespace Serializer {
  export type ID = JSONAPI.ID;

  export interface Protocol<T> {
    getType(model: T): string;
    getID(model: T): string | number;
    getAttributes(model: T): string[];
    getAttribute(model: T, attribute: string): any;
  }

  export interface Serializable {
    ["@@SerializerProtocol"]: Protocol<any>;
  }
}

export default Serializer;