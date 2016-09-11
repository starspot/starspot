import { expect } from "chai";

import { StubUI } from "./helpers/stubs";

import Project from "../src/project";
import Task from "../src/task";
import Command from "../src/command";
import UI from "../src/ui";

describe("Project", function() {
  function fixture(fixturePath: string) {
    return `${__dirname}/fixtures/${fixturePath}`;
  }

  let basicProjectFixture = fixture("basic-project/foo/bar");

  it("can be instantiated", function() {
    let project = new Project();
    expect(project).to.exist;
  });

  it("finds project if cwd is deeply nested", function() {
    let project = new Project({
      cwd: basicProjectFixture
    });

    expect(project.rootPath).to.equal(__dirname + "/fixtures/basic-project");
  });

  it("uses the precompiled dist directory in production", function() {
    let oldEnv = process.env.NODE_ENV;

    try {
      process.env.NODE_ENV = "production";

      let project = new Project({
        cwd: basicProjectFixture
      });

      expect(project.rootPath).to.equal(__dirname + "/fixtures/basic-project");
      expect(project.containerRootPath).to.equal(__dirname + "/fixtures/basic-project/dist/");
    } finally {
      process.env.NODE_ENV = oldEnv;
    }
  });

  it("reads the project's package.json and exposes it as pkg", function() {
    let project = new Project({
      cwd: basicProjectFixture
    });

    expect(project.pkg).to.deep.equal({
      name: "basic-project",
      version: "1.0.0"
    });
  });

  it("reads the project's name from package.json", function() {
    let project = new Project({
      cwd: basicProjectFixture
    });

    expect(project.name).to.equal("basic-project");
  });

  it("instantiates named tasks", function() {
    let project = new Project({
      cwd: basicProjectFixture
    });

    let task = project.getTask("start-server");

    expect(task).to.be.an.instanceof(Task);
    expect(task.constructor.name).to.equal("ServerTask");
  });

  it("instantiates the application with UI and rootPath", function() {
    let project = new Project({
      ui: new UI(),
      cwd: basicProjectFixture
    });

    // Fixtures contain a stub application that is just a constructor function
    // that assigns passed options as properties.
    let app: any = project.application();
    expect(app.ui).to.be.an.instanceof(UI);
    expect(app.rootPath).to.be.equal(__dirname + "/fixtures/basic-project");
  });

  it("returns a list of available Command classes", function() {
    let project = new Project({
      cwd: basicProjectFixture
    });

    let commands = project.commands;

    commands.forEach(command => {
      expect(command.prototype).to.be.an.instanceof(Command);
    });

    expect(commands.length).to.equal(2);
  });

  it("discovers installed in-app addons", function() {
    let ui = new StubUI();
    ui.expect(["addon-no-package-json", "addon-malformed-package-json", "addon-not-really-an-addon"]);

    let project = new Project({
      ui: ui,
      cwd: fixture("in-app-addons-project")
    });

    expect(project.addons.map(a => a.name)).to.include.members(["addon-a", "addon-b"]);
    expect(ui.loggedEvents).to.deep.include({
      name: "addon-no-package-json",
      category: "warn",
      addon: "empty-directory"
    });

    expect(ui.loggedEvents).to.deep.include({
      name: "addon-malformed-package-json",
      category: "warn",
      addon: "malformed-package-json"
    });

    expect(ui.loggedEvents).to.deep.include({
      name: "addon-not-really-an-addon",
      category: "warn",
      addon: "not-an-addon"
    });
  });

  it("discovers commands in addons", function() {
    let project = new Project({
      cwd: fixture("addons-with-commands-project")
    });

    let myCommand = project.commands
      .find(command => command.command === "my-command");

    expect(myCommand).to.exist;
    expect(myCommand.prototype).to.be.an.instanceof(Command);
  });

  it("discovers initializers in addons", async function() {
    let project = new Project({
      cwd: fixture("addons-with-initializers-project")
    });

    let application: any = project.application();
    await application.boot();

    expect(application.initializerA).to.be.true;
    expect(application.initializerB).to.be.true;
  });

});