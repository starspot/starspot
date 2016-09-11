import Addon from "../../../../../src/addon";

let initializer = {
  name: "initializer-a",
  initialize(app: any) {
    app.initializerA = true;
  }
};

export default class MyAddon extends Addon {
  initializers = [initializer];
}