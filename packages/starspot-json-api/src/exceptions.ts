export class JSONAPIError extends Error {
  statusCode: number;
}

export class InvalidDataFormat extends JSONAPIError {
  statusCode = 400;
}