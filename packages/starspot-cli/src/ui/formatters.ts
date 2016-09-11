import { blue, dim } from "chalk";

/*
 * Formatters turn JSON event objects into user-readable messages to be printed
 * to the console.
 */

export interface Formatters {
  [index: string]: {
    [index: string]: (event: any) => string;
  };
}

export default <Formatters>{
  "info": {
    "server-started"({ address }) {
      return `Listening on ${address.url}`;
    },

    "setup-complete"() {
      return `Setup complete`;
    },

    "dns-started"() {
      return "DNS server started";
    },

    "dispatch-start"() {
      return null;
    },

    "dispatch-route-not-found"({ verb, path }) {
      return `${verb} ${path} → 404`;
    },

    "dispatch-dispatching"({ verb, path, controller, method }) {
      let invocation = blue(controller + dim(".") + method + dim("()"));
      return `${verb} ${path} → ${invocation}`;
    },

    "dispatch-complete"({ verb, path, time }) {
      return `${verb} ${path} ← ${blue(formatHRTime(time))}`;
    }
  },

  "error": {
    "no-ssl"({ missingFile }) {
      return `Unable to enable SSL: couldn't find missing file ${missingFile}`;
    },

    "conflicting-modules"({ entityName, entityType, paths }: { entityName: string, entityType: string, paths: string[] }) {
      return `Starspot found multiple files that could be the ${entityName} ${entityType}, \
and doesn't know which one to load. To fix this, merge or delete all but one \
of the following files:

${paths.map(p => `* ${p}`).join("\n")}`;
    },

    "no-default-export"({ path }) {
      return `File at ${path} does not export a default value. Make sure you are exporting a default value from this module, using the \`export default ...\` syntax.`;
    },

    "Error"(error) {
      return error.stack;
    }
  },

  "prompt": {
    "ask-setup-prelude"({ appName, subtaskMessages }: { appName: string, subtaskMessages: string[] }) {
      let subtaskMessage = subtaskMessages.map(m => `  * ${m.trim()}`).join("\n");

      return `To use ${appName}, we need to do some setup to get\
 SSL working. This requires root access, but only happens once.

Specifically, we need to:

${subtaskMessage}\n
`;
    },

    "ask-setup"() {
      return "OK to proceed? You will be prompted for your password.";
    }
  }
};

function formatHRTime([seconds, nanoseconds]: [number, number]): string {
  let result: string[] = [];

  if (seconds) {
    result.push(`${seconds}s`);
  }

  let milliseconds = nanoseconds / 1000000;
  result.push(`${milliseconds}ms`);
  result.push(` (${Math.round(60000 / milliseconds)} req/s)`);

  return result.join("");
}