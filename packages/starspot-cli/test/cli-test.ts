import { expect } from "chai";
import Command from "../src/command";
import CLI from "../src/cli";

describe("CLI", function() {
  let runCount = 0;

  class RunTestCommand extends Command {
    static command = "run-test";
    static aliases = ["rt"];

    async run(): Promise<any> {
      runCount++;
    }
  }

  let project: any = {
    builtInCommands: [
      RunTestCommand
    ]
  };

  beforeEach(function() {
    runCount = 0;
  });

  it("finds the command based on name", async function() {
    let cli = new CLI({
      project,
      argv: ["run-test"]
    });

    await cli.run();

    expect(runCount).to.equal(1);
  });

  it("finds the command based on an alias", async function() {
    let cli = new CLI({
      project,
      argv: ["rt"]
    });

    await cli.run();

    expect(runCount).to.equal(1);
  });
});