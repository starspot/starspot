import { exec } from "mz/child_process";
import { stat, mkdir } from "mz/fs";
import Task from "../task";
import { SetupSubtask } from "./setup";
import { SSL_KEY_PATH, SSL_CERT_PATH, DNS_TLD } from "../config";

export default class GenerateSSLCertsTask extends Task implements SetupSubtask {
  public installMessage = `
    Generate a self-signed SSL certificate and tell the system to trust it
  `;

  async run() {
    try {
      await mkdir("ssl");
    } catch (e) {
      if (e.code !== "EEXIST") {
        throw e;
      }
    }

    let subjects = {
      CN: `${process.env.USER}.${DNS_TLD}`
    };

    await exec(`openssl req -nodes -new -x509 -subj ${formatSubjects(subjects)} -keyout ${SSL_KEY_PATH} -out ${SSL_CERT_PATH} -batch`);
    await exec(`security add-trusted-cert -k \`security default-keychain | xargs\` ssl/server.cert`);
  }

  async requiresSetup() {
    let [keyExists, certExists] = await Promise.all([
      exists(SSL_KEY_PATH),
      exists(SSL_CERT_PATH)
    ]);

    return !keyExists || !certExists;
  }
}

async function exists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch (e) {
    return false;
  }
}

function formatSubjects(subjects: { CN: string }) {
  let formatted: string[] = [];

  for (let key in subjects) {
    formatted.push(`${key}=${subjects.CN}`);
  }

  return `/${formatted.join("/")}/`;
}