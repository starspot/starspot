import Model from "../model";

export default class JSONAPISerializer {
  serialize(model: Model) {
    let payload = {
      data: <any> {}
    };

    payload.data.type = model._meta.type;
  }
}