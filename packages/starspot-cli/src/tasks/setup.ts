import Task from "../task";
import InstallResolverTask from "./install-resolver";
import GenerateSSLCerts from "./generate-ssl-certs";

export interface SetupSubtask {
  invoke(): Promise<void>;
  requiresSetup(): Promise<boolean>;
  installMessage: string;
}

export default class SetupTask extends Task {
  private setupTasks: SetupSubtask[] = [
    new InstallResolverTask({ ui: this.ui, project: this.project, env: this.env }),
    new GenerateSSLCerts({ ui: this.ui, project: this.project, env: this.env })
  ];

  async run() {
    let subtasks = await this.findSubtasks();

    if (!subtasks.length) { return; }
    if (process.env.NODE_ENV === "production") { return; }

    let okayToProceed = await this.ui.askOne({
      name: "ask-setup",
      appName: this.project.name,
      subtaskMessages: subtasks.map(s => s.installMessage)
    });

    if (okayToProceed) {
      let invoke: Promise<void>;

      subtasks.forEach(subtask => {
        invoke = invoke ? invoke.then(() => subtask.invoke()) : subtask.invoke();
      });

      await invoke;

      this.ui.info({
        name: "setup-complete"
      });
    }
  }

  async findSubtasks(): Promise<SetupSubtask[]> {
    let tasks = await Promise.all(this.setupTasks.map(task => {
      return task.requiresSetup()
        .then(result => result ? task : null);
    }));

    return tasks.filter(t => !!t);
  }
}