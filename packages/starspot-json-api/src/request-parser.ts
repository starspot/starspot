import inflected = require("inflected");
import { Container } from "starspot-core";

import Operation, { GetOperation } from "./operation";
import Resource from "./resource";
import UnhandledActionError from "./errors/unhandled-action-error";
import JSONAPI from "./index";

export interface RequestParameters {
  /** The controller action used to process this request. */
  action: string;

  /** The name of the controller processing this request. */
  controller: string;

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
    let op = new GetOperation();
    op.resource = this.resource;
    this.operations.push(op);
  }

  get resource(): typeof Resource {
    let resourceName = inflected.singularize(this.params.controller);
    return new (this.container.findFactory("resource", resourceName))();
  }
}