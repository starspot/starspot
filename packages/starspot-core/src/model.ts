import { Serializer as JSONAPISerializer } from "starspot-json-api";
import Container from "./container";

export type ID = JSONAPISerializer.ID;

class Serializer implements JSONAPISerializer.Protocol<Model> {
  getType(model: Model): string {
    let meta = Container.metaFor(model);

    if (meta && meta.name) {
      return meta.name;
    }

    return model.constructor.name.toLowerCase();
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

class Model implements JSONAPISerializer.Serializable {
  [attribute: string]: any;

  static attributes: string[] = [];

  "@@SerializerProtocol": JSONAPISerializer.Protocol<Model> = serializer;

  id: ID;

  constructor(attributes?: any) {
    if (attributes) {
      Object.assign(this, attributes);
    }
  }

  validate(): boolean {
    return true;
  }

  save(): Promise<this> {
    return Promise.resolve(this);
  }
}

export default Model;