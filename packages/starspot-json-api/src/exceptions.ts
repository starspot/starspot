export class JSONAPIError extends Error {
  statusCode: number;
}

export class InvalidDataFormat extends JSONAPIError {
  statusCode = 400;
}

export class ResourceTypeMismatch extends JSONAPIError {
  statusCode = 422;
}