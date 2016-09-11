import { expect } from "chai";
import * as rp from "request-promise";

import { Environment } from "starspot";
import Project from "../src/project";

import { StubProject, StubUI } from "./helpers/stubs";

import { ServerAddressInfo } from "../src/tasks/start-server";
import ServerCommand from "../src/commands/server";

describe("ServerCommand", function() {
  let ui: StubUI;

  beforeEach(function() {
    ui = new StubUI();
  });

  it("runs the setup task, followed by the DNS and HTTP server tasks", async function() {
    let env = new Environment("development");

    let project = new StubProject();
    project.stubTask("setup");
    project.stubTask("start-dns");
    project.stubTask("start-server");

    let command = new ServerCommand({
      env,
      ui,
      project: project
    });

    await command.run();

    // Verify that the first task invoked is setup.
    expect(project.invokedTasks[0]).to.equal("setup");

    // Order in which the DNS server and the HTTP(S) server are started doesn't matter,
    // so just check that they both got called at some point.
    expect(project.invokedTasks.slice(1)).to.include.members(["start-dns", "start-server"]);
  });

  it("emits a UI event when the server starts", async function() {
    let env = new Environment("development");

    let project = new StubProject({
      cwd: __dirname + "/fixtures/https-server-project"
    });

    project.stubTask("setup");
    project.stubTask("start-dns");

    let command = new ServerCommand({
      env,
      ui,
      project: project
    });

    let info = await command.run();

    try {
      let startedEvent: any = ui.loggedEvents.find(e => e.name === "server-started");
      expect(startedEvent).to.exist;
      expect(startedEvent.address).to.exist;
      expect(startedEvent.address.port).to.equal(8000);
      expect(startedEvent.address.url).to.match(/https:\/\/(.*):8000/);
    } finally {
      info.server.close();
    }
  });

  it("does not run the setup task in production mode", async function() {
    let env = new Environment("production");

    let project = new StubProject();
    let setupTask = project.stubTask("setup");
    project.stubTask("start-dns");
    project.stubTask("start-server");

    let command = new ServerCommand({
      env,
      ui,
      project: project
    });

    await command.run();

    expect(setupTask.runCount).to.equal(0, "setup task should have been run zero times");
  });

});

describe("ServerTask", function() {

  ["http", "https"].forEach(protocol => {

    describe(`over ${protocol.toUpperCase()}`, function() {
      let project = new Project({
        cwd: __dirname + `/fixtures/${protocol}-server-project`
      });

      it("starts a server on port 8000 by default", async function() {
        let task = project.getTask("start-server");
        let info = await task.invoke<ServerAddressInfo>();

        try {
          let body = await rp(`${protocol}://localhost:8000`, {
            agentOptions: {
              rejectUnauthorized: false
            }
          });
          expect(body).to.equal("Hello world");
        } finally {
          await cleanup(info);
        }

      });

      it("starts a server on port specified by PORT environment variable", async function() {
        let oldPort = process.env.PORT;

        try {
          process.env.PORT = 43294;
          let task = project.getTask("start-server");
          let info = await task.invoke<ServerAddressInfo>();

          try {
            let body = await rp(`${protocol}://localhost:43294`, {
              agentOptions: {
                rejectUnauthorized: false
              }
            });
            expect(body).to.equal("Hello world");
          } finally {
            await cleanup(info);
          }
        } finally {
          if (oldPort) {
            process.env.PORT = oldPort;
          } else {
            delete process.env.PORT;
          }
        }
      });
    });

  });

});

function cleanup(info: ServerAddressInfo): Promise<any> {
  return new Promise((resolve, reject) => {
    info.server.close();
    info.server.on("close", resolve);
    info.server.on("error", reject);
  });
}