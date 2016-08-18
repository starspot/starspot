import getStackTrace from "./util/get-stack-trace";

export interface Meta {
  type: string;
}

export default class Model {
  _meta: Meta;

  constructor() {
    console.log(getStackTrace(1));
  }
}