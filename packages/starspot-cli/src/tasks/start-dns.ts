import { fork } from "mz/child_process";
import Task from "../task";

export default class StartDNSTask extends Task {
  async run() {
    fork(__dirname + "/../../dns");
    this.ui.info({ name: "dns-started" });
  }
}