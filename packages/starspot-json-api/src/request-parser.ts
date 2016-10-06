import inflected = require("inflected");
import { Container } from "starspot-core";

import Operation, { OperationOptions } from "./operation";
import GetResourcesOperation from "./operations/get-resources";
import Resource from "./resource";
import UnhandledActionError from "./errors/unhandled-action-error";
import JSONAPI from "./index";

export interface ConcreteOperation {
  new (options: {}): Operation;
}

export interface RequestParameters {
  /** The controller action used to process this request. */
  action: string;

  /** The name of the controller processing this request. */
  controllerName: string;

  /** Query parameters for the incoming request. */
  query?: any;

  /** Method that returns a promise that resolves to a JSON API document. */
  json(): Promise<JSONAPI.Document>;
}

export default class RequestParser {
  public container: Container;
  public params: RequestParameters;
  private operations: Operation[];
  private json: any;

  constructor(params: RequestParameters, container: Container) {
    this.params = params;
    this.container = container;
  }

  async parse(): Promise<Operation[]> {
    if (this.operations) { return this.operations; }
    this.operations = [];

    this.json = await this.params.json();

    let action = this.params.action;

    switch (action) {
      case "index":
        this.processIndex();
        break;
      default:
        throw new UnhandledActionError();
    }

    return this.operations;
  }

  processIndex() {
    this.op(GetResourcesOperation, { name: this.params.controllerName });
  }

  op(Op: ConcreteOperation, options: OperationOptions) {
    options.container = this.container;

    this.operations.push(new Op(options));
  }

  get resource(): Resource {
    let resourceName = inflected.singularize(this.params.controllerName);
    return this.container.findInstance("resource", resourceName);
  }
}