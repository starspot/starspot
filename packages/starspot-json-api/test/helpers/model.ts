import { Reflector, Model as CoreModel } from "starspot-core";
import Inflected = require("inflected");

export default class Model extends CoreModel {
  _id: string;
  _setType: string;

  constructor(options: any) {
    super();

    this._id = String(options.id);
    delete options.id;

    Object.assign(this, options);
  }

  set _type(type: string) {
    this._setType = type;
  }

  get _type() {
    return this._setType || Inflected.dasherize(this.constructor.name).toLowerCase();
  }
}

class ModelReflector implements Reflector {
  getType(model: any) {
    return model._type;
  }

  getID(model: any) {
    return model._id;
  }

  getAttributes(model: any) {
    let verboten = ["_id", "_type"];
    let attributes = Object.keys(model).filter(k => verboten.indexOf(k) < 0);

    return attributes;
  }

  getAttribute(model: any, attribute: string) {
    return model[attribute];
  }

  getRelationships(model: any) {
    return this.getAttributes(model)
      .filter(k => k.substr(-12) !== "Relationship")
      .map(k => k.substr(0, k.length - 12));
  }

  getRelationship(model: any, relationship: string) {
    let hasOneKey = relationship + "Relationship";
    if (hasOneKey in model) {
      let id = (model[hasOneKey] && model[hasOneKey]._id) || null;

      return new Reflector.HasOneRelationship(relationship, id, () => {
        return new Model(model[hasOneKey]);
      });
    }
  }

  async validate() {
    return true;
  }
}

Reflector.install(Model, new ModelReflector());
