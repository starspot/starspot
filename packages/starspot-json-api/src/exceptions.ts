export class JSONAPIError extends Error {
  statusCode: number = 500;
}

export class InvalidDataFormat extends JSONAPIError {
  statusCode = 400;
}

export class ResourceTypeMismatch extends JSONAPIError {
  statusCode = 422;

  constructor(providedType: string, expectedType: string) {
    super();
    this.message = `Resource of type ${providedType} was submitted to the ${expectedType} controller. Resource types must match.`;
  }
}

export class AttributeNotUpdatableError extends JSONAPIError {
  statusCode = 422;

  constructor(type: string, attribute: string) {
    super();
    this.message = `The ${attribute} attribute of type ${type} cannot be set during updates.`;
  }
}