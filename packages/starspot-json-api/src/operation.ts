import Resource from "./resource";

abstract class Operation {
  op: string;
  resource: typeof Resource;
}

export default Operation;

export class GetOperation extends Operation {
  op = "get";
}