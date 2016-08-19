import JSONAPISerializer from "./json-api/serializer";
import Resolver from "./resolver";

export type ID = JSONAPISerializer.ID;

class Serializer implements JSONAPISerializer.Protocol<Model> {
  getType(model: Model): string {
    return Resolver.metaFor(model).name;
  }

  getID(model: Model): ID {
    return model.id;
  }

  getAttributes(model: Model) {
    return (model.constructor as typeof Model).attributes;
  }

  getAttribute(model: Model, attribute: string) {
    return model[attribute];
  }
}

const serializer = new Serializer();

export default class Model implements JSONAPISerializer.Serializable {
  [attribute: string]: any;

  static attributes: string[] = [];

  "@@SerializerProtocol": JSONAPISerializer.Protocol<Model> = serializer;

  id: ID;

  constructor() {
  }
}