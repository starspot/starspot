export class JSONAPIError extends Error {
  statusCode: number;
}

export class InvalidDataFormat extends JSONAPIError {
  statusCode = 400;
}

export class ResourceTypeMismatch extends JSONAPIError {
  constructor(providedType: string, expectedType: string) {
    super();
    this.message = `Resource of type ${providedType} was submitted to the ${expectedType} controller. Resource types must match.`;
  }

  statusCode = 422;
}