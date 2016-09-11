import { Environment } from "starspot";
import Project from "../../src/project";
import Task from "../../src/task";
import UI from "../../src/ui";
import { EventEmitter } from "events";

export interface TaskConstructorOptions {
  project: Project;
  ui?: UI;
  env?: Environment;
}

export class StubTask extends Task {
  runCount = 0;
  emitter = new EventEmitter();

  constructor(options: TaskConstructorOptions) {
    super({
      ui: options.ui || new UI(),
      project: options.project,
      env: options.env || new Environment()
    });
  }

  async run() {
    this.runCount++;
    this.emitter.emit("run");
  }
}

export class StubProject extends Project {
  public invokedTasks: string[] = [];
  private _stubTasks: { [key: string]: Task } = {};

  stubTask(taskName: string): StubTask {
    let task = this._stubTasks[taskName] = new StubTask({ project: this });
    task.emitter.on("run", () => {
      this.invokedTasks.push(taskName);
    });

    return task;
  }

  getTask(taskName: string): Task {
    let stub: Task;

    if (stub = this._stubTasks[taskName]) {
      return stub;
    }

    return super.getTask(taskName);
  }
}

export class StubUI extends UI {
  loggedEvents: UI.Event[] = [];

  private _hasExpectedEvents = false;
  private _expectedEvents: string[] = [];

  expect(eventNames: string[]) {
    this._hasExpectedEvents = true;
    this._expectedEvents.push(...eventNames);
  }

  _log(event: UI.Event) {
    this.loggedEvents.push(event);
    if (this._hasExpectedEvents && !this._expectedEvents.includes(event.name)) {
      throw new Error("UI received unexpected event " + event.name);
    }
  }

}