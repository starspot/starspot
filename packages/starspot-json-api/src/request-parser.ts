import inflected = require("inflected");
import { Application, Container } from "starspot-core";

import Resource from "./resource";
import JSONAPI from "./json-api";

import Operation, { OperationOptions, CallbackTarget } from "./operation";
import GetResourcesOperation from "./operations/get-resources";
import GetResourceOperation from "./operations/get-resource";
import CreateResourceOperation from "./operations/create-resource";
import UpdateResourceOperation from "./operations/update-resource";

import UnhandledActionError from "./errors/unhandled-action-error";
import { ResourceTypeMismatch } from "./exceptions";

export interface ConcreteOperation {
  new (options: {}): Operation;
}

export interface RequestParameters {
  /** The HTTP request. */
  request: Application.Request;

  /** The controller action used to process this request. */
  action: string;

  /** The name of the controller processing this request. */
  controllerName: string;

  /** Params extracted from URL segments, such as `id` **/
  urlParams: { [key: string]: any };

  /** Method that returns a promise that resolves to a JSON API document. */
  json(): Promise<JSONAPI.Document>;
}

export default class RequestParser {
  public container: Container;
  public params: RequestParameters;
  private operations: Operation[];
  private json: JSONAPI.DataDocument;
  private target: CallbackTarget;

  constructor(params: RequestParameters, container: Container, target: CallbackTarget) {
    this.params = params;
    this.container = container;
    this.target = target;
  }

  async parse(): Promise<Operation[]> {
    if (this.operations) { return this.operations; }
    this.operations = [];

    this.json = await this.params.json() as JSONAPI.DataDocument;

    let action = this.params.action;

    switch (action) {
      case "index":
        this.processIndex();
        break;
      case "show":
        this.processShow();
        break;
      case "create":
        this.processCreate();
        break;
      case "update":
        this.processUpdate();
        break;
      default:
        throw new UnhandledActionError();
    }

    return this.operations;
  }

  processIndex() {
    this.op(GetResourcesOperation, {
      type: this.params.controllerName
    });
  }

  processShow() {
    let id = this.params.urlParams["id"];

    this.op(GetResourceOperation, {
      id,
      type: this.params.controllerName
    });
  }

  processCreate() {
    let data = this.json.data as JSONAPI.ResourceObject;
    let { type, id, attributes } = data;
    let controllerType = this.params.controllerName;

    if (!typesMatch(type, controllerType)) {
      throw new ResourceTypeMismatch(type, controllerType);
    }

    this.op(CreateResourceOperation, {
      id,
      type,
      attributes
    });
  }

  processUpdate() {
    let data = this.json.data as JSONAPI.ResourceObject;
    let { type, id, attributes } = data;
    let controllerType = this.params.controllerName;

    if (!typesMatch(type, controllerType)) {
      throw new ResourceTypeMismatch(type, controllerType);
    }

    this.op(UpdateResourceOperation, {
      resourceName: this.params.controllerName,
      id,
      type,
      attributes
    });
  }

  op(Op: ConcreteOperation, options: OperationOptions) {
    options.container = this.container;
    options.target = this.target;

    this.operations.push(new Op(options));
  }

  get resource(): typeof Resource {
    let resourceName = inflected.singularize(this.params.controllerName);
    return this.container.findFactory("resource", resourceName);
  }
}

/**
 * Verifies that a submitted resource's type matches the controller's type.
 */
function typesMatch(theirType: string, ourType: string) {
  if (theirType === ourType) { return true; }
  if (inflected.singularize(theirType) === ourType) { return true; }

  return false;
}
