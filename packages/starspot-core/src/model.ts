import Reflector, { Reflectable } from "./reflector";
import Inquirer from "./inquirer";

// Ideally we want to capture the fact that:
//   1. A model instance must implement Reflectable, and
//   2. A model class must implement Queryable
//
// ..but that isn't currently possible in TypeScript.
class Model implements Reflectable {
  static "@@StarspotInquirer": Inquirer;
  "@@StarspotReflector": Reflector;
  async validate?(): Promise<boolean>;
}

export default Model;