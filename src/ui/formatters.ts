/**
 * Formatters turn JSON event objects into user-readable messages to be printed
 * to the console.
 */

import { Event } from "./index";

export interface IFormatters {
  [index: string]: {
    [index: string]: (event: any) => string;
  };
}

export default <IFormatters>{
  "info": {
    "server-started"({ address }) {
      return `Listening on ${address.url}`;
    },

    "setup-complete"() {
      return `Setup complete`;
    },

    "dns-started"() {
      return "DNS server started";
    }
  },

  "error": {
    "no-ssl"({ missingFile }) {
      return `Unable to enable SSL: couldn't find missing file ${missingFile}`;
    },

    "Error"({ code, syscall, path }) {
      return `Permission denied when attempting to ${syscall} ${path}.`;
    }
  },

  "prompt": {
    "ask-setup-prelude"({ appName, subtaskMessages }: { appName: string, subtaskMessages: string[] }) {
      let subtaskMessage = subtaskMessages.map(m => `  * ${m.trim()}`).join("\n");

      return `\n\nTo use ${appName}, there is some setup we need to do to your computer to get\
 SSL working. This setup may require root access, but only needs to happen this one time.

Specifically, we need to:

${subtaskMessage}
`;
    },

    "ask-setup"({ appName, subtaskMessages }: { appName: string, subtaskMessages: string[] }) {
      return "OK to proceed?";
    }
  }
};