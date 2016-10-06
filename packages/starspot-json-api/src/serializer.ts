import JSONAPI from "./index";
import Reflector from "./reflector";

interface Attributes {
  [attr: string]: any;
}

class Serializer {
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
    attributes[attribute] = attrValue === undefined ? null : reflector.getAttribute(model, attribute);
  }

  return {
    id: reflector.getID(model),
    type: reflector.getType(model),
    attributes: attributes
  };
}

export default Serializer;