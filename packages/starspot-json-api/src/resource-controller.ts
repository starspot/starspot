import { Controller, Container } from "starspot-core";
import RequestParser from "./request-parser";
import Serializer from "./serializer";
import { Result } from "./results";
import JSONAPI from "./index";

export default class ResourceController extends Controller {
  async index(params: Controller.Parameters) {
    return this.processRequest(params);
  }

  async create(params: Controller.Parameters) {
    return this.processRequest(params);
  }

  private async processRequest(params: Controller.Parameters) {
    let response = params.response;
    response.setHeader("Content-Type", JSONAPI.CONTENT_TYPE);

    let requestParser = new RequestParser(params, Container.containerFor(this));

    try {
      let operations = await requestParser.parse();
      let results: Result[] = [];

      for (let i = 0; i < operations.length; i++) {
        let op = operations[i];
        results.push(await op.process());
      }

      let serializer = new Serializer();
      let { json, statusCode } = serializer.serializeResults(results);
      response.statusCode = statusCode;

      return json;
    } catch (e) {
      console.log("ERROR");
      console.log(e);
      throw e;
    }
  }
}