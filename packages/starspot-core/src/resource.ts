import JSONAPI from "starspot-json-api";
import Controller from "./controller";
import Model from "./model";

export default class Resource extends Controller {
  async create(params: Controller.Parameters) {
    return this.processRequest(params);
  }

  async afterCreate(_: Model) {

  }

  private async processRequest(params: Controller.Parameters) {
    if (params.request.headers["content-type"] !== "application/vnd.api+json") {
      throw new Error("JSON API requests must have a content type of application/vnd.api+json");
    }

    let json = await params.json();

    if (isDataDocument(json)) {
      let data = json.data as JSONAPI.ResourceObject;
      let type = data.type;
      let model = this.createModel(type);

      Object.keys(data.attributes).forEach(key => {
        model[key] = data.attributes[key];
      });

      if (!model.validate()) {
        params.response.statusCode = 422;
        return;
      }

      await model.save();
      await this.afterCreate(model);

      return model;
    } else {
      throw new Error("Not a valid JSON API document");
    }
  }
}

function isDataDocument(json: JSONAPI.Document): json is JSONAPI.DataDocument {
  return (json as JSONAPI.DataDocument).data !== undefined;
}