import JSONAPI from "./interfaces";

interface Attributes {
  [attr: string]: any;
}

class Serializer {
  serialize(model: Serializer.Serializable) {
    let payload = {
      data: <any> {}
    };

    let protocol = model["@@SerializerProtocol"];

    payload.data.id = protocol.getID(model);
    payload.data.type = protocol.getType(model);

    let attributes: Attributes = payload.data.attributes = { };

    for (let attribute of protocol.getAttributes(model)) {
      attributes[attribute] = protocol.getAttribute(model, attribute);
    }

    return payload;
  }
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