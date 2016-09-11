import Command from "../command";
import { default as Blueprint } from "blueprinter";

export default class GenerateCommand extends Command {
  static command = "generate";
  static description = "Generates new code from a blueprint.";

  static aliases = ["g"];

  async run({ args }: { args: string[] }): Promise<any> {
    let blueprint = new Blueprint({
      source: __dirname + "../../blueprints/app",
      destination: process.cwd() + "/" + args[0],
      fileVariables: {
        appName: args[0]
      }
    });

    blueprint.install();
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