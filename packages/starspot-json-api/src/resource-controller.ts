import { Controller, Container } from "starspot-core";
import RequestParser from "./request-parser";
import JSONAPI from "./index";

export default class ResourceController extends Controller {
  async index(params: Controller.Parameters) {
    return this.processRequest(params);
  }

  private async processRequest(params: Controller.Parameters) {
    let response = params.response;
    response.setHeader("Content-Type", JSONAPI.CONTENT_TYPE);

    let requestParser = new RequestParser(params, Container.containerFor(this));

    try {
      let operations = await requestParser.parse();
      return operations.map(op => op.process())[0];
    } catch (e) {
      console.log("ERROR");
      console.log(e);
      throw e;
    }
  }
}