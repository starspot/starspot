import Resource from "./resource";


export class Result {
  constructor(public statusCode = 200) {
  }
}

export class ResourceResult extends Result {
  constructor(public resource: Resource, statusCode?: number) {
    super(statusCode);
  }
}

export class ResourcesResult extends Result {
  constructor(public resources: Resource[], statusCode?: number) {
    super(statusCode);
  }
}