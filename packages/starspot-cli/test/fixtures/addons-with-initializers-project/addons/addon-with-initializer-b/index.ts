import Addon from "../../../../../src/addon";

let initializer = {
  name: "initializer-b",
  initialize(app: any) {
    app.initializerB = true;
  }
};

export default class MyAddon extends Addon {
  initializers = [initializer];
}