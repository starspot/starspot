import { Controller, Container } from "starspot-core";
import RequestParser from "./request-parser";
import Serializer from "./serializer";
import { Result } from "./results";
import JSONAPI from "./json-api";
import { JSONAPIError } from "./exceptions";

export default class ResourceController extends Controller {
  async index(params: Controller.Parameters): Promise<JSONAPI.Document> {
    return this.processRequest(params);
  }

  async create(params: Controller.Parameters): Promise<JSONAPI.Document> {
    return this.processRequest(params);
  }

  async update(params: Controller.Parameters): Promise<JSONAPI.Document> {
    return this.processRequest(params);
  }

  async invokeCallback(event: string, ...args: any[]) {
    let callbacks = callbacksFor(this, event);
    for (let i = 0; i < callbacks.length; i++) {
      let method = this[callbacks[i]] as Function;
      await method.apply(this, args); 
    }
  }

  private async processRequest(params: Controller.Parameters) {
    let response = params.response;
    response.setHeader("Content-Type", JSONAPI.CONTENT_TYPE);

    let requestParser = new RequestParser(params, Container.containerFor(this), this);

    try {
      let operations = await requestParser.parse();
      let results: Result[] = [];

      for (let i = 0; i < operations.length; i++) {
        let op = operations[i];
        results.push(await op.process());
      }

      let serializer = new Serializer();
      serializer.container = Container.containerFor(this);
      let { json, statusCode } = await serializer.serializeResults(results);
      response.statusCode = statusCode;

      return json;
    } catch (e) {
      if (e instanceof JSONAPIError) {
        let response = params.response;
        response.statusCode = e.statusCode;
        let errors = [e.message];
        params.response.write(JSON.stringify({
          errors
        }));
      } else {
        console.log("ERROR");
        console.log(e);
        throw e;
      }
    }
  }
}

export function after(event: string) {
  return function(proto: ResourceController, method: string) {
    callbacksFor(proto, event).push(method);
  }
}

function callbacksFor(proto: any, event: string) {
  let callbacks = proto["@@callbacks"];
  if (!callbacks) {
    proto["@@callbacks"] = callbacks = {};
  }

  let eventCallbacks = callbacks[event];
  if (!eventCallbacks) {
    callbacks[event] = eventCallbacks = [];
  }

  return eventCallbacks;
}