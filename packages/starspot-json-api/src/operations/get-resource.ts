import Operation from "../operation";
import { ResourceResult } from "../results";

export default class GetResourceOperation extends Operation {
  name: string;
  id: string;

  async process() {
    if (!this.id) { throw new Error("You must provide an id when showing"); }

    let Resource = this.findResource();

    let model = await Resource.findByID(this.id);

    return new ResourceResult(new Resource(model));
  }
}
