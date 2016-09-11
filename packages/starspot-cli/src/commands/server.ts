import Command from "../command";
import { ServerAddressInfo } from "../tasks/start-server";

const defaultPort = process.env.PORT || 8000;

export default class ServerCommand extends Command {
  static command = "serve";
  static description = "Starts a development HTTPS server.";

  static aliases = ["server", "s"];

  static availableOptions = [
    { name: "port",                 type: Number,  default: defaultPort,   aliases: ["p"] },
    { name: "host",                 type: String,                          aliases: ["H"],     description: "Listens on all interfaces by default" },
    { name: "proxy",                type: String,                          aliases: ["pr", "pxy"] },
    { name: "secure-proxy",         type: Boolean, default: true,          aliases: ["spr"],   description: "Set to false to proxy self-signed SSL certificates" },
    { name: "transparent-proxy",    type: Boolean, default: true,          aliases: ["transp"], description: "Set to false to omit x-forwarded-* headers when proxying" },
    { name: "watcher",              type: String,  default: "events",      aliases: ["w"] },
    { name: "live-reload",          type: Boolean, default: true,          aliases: ["lr"] },
    { name: "live-reload-host",     type: String,                          aliases: ["lrh"],   description: "Defaults to host" },
    { name: "live-reload-base-url", type: String,                          aliases: ["lrbu"],  description: "Defaults to baseURL" },
    { name: "live-reload-port",     type: Number,                          aliases: ["lrp"],   description: "(Defaults to port number within [49152...65535])" },
    { name: "environment",          type: String,  default: "development", aliases: ["e", { "dev": "development" }, { "prod": "production" }] },
    { name: "output-path",          type: "Path",  default: "dist/",       aliases: ["op", "out"] },
    { name: "ssl",                  type: Boolean, default: false },
    { name: "ssl-key",              type: String,  default: "ssl/server.key" },
    { name: "ssl-cert",             type: String,  default: "ssl/server.crt" }
  ];

  async run(): Promise<ServerAddressInfo> {
    if (this.env.isDevelopment) {
      let setupTask = this.project.getTask("setup");
      await setupTask.invoke();
    }

    let dnsTask = this.project.getTask("start-dns");
    let serverTask = this.project.getTask("start-server");

    let [, address] = await Promise.all<void, ServerAddressInfo>([dnsTask.invoke(), serverTask.invoke()]);

    this.ui.info({ name: "server-started", address });

    return address;
  }
}

// import { red } from "chalk";

// import Project from "../project";
// import HandledError from "../errors/handled-error";

// let project = new Project();
// let setup = project.getTask("setup");
// let startServer = project.getTask("server");

// setup.invoke()
//   .then(() => startServer.invoke())
//   .then((address) => {
//     project.ui.info({ name: "server-started", address });
//   })
//   .then(() => {
//   })
//   .catch(e => {
//     if (!(e instanceof HandledError)) {
//       console.log(red(e.stack));
//     }
//   })