import * as http from "http";
import * as http2 from "http2";
import * as dotenv from "dotenv";
import * as chokidar from "chokidar";
import { readFile } from "mz/fs";

import { Application, Container } from "starspot";
import Task from "../task";
// import SSLNotFoundError from "../errors/ssl-not-found-error";
import { SSL_KEY_PATH, SSL_CERT_PATH, DNS_TLD } from "../config";

export type Server = http.Server | http2.Server;

export interface ServerAddressInfo {
  server?: Server;
  address: string;
  port: number;
  family: string;
  url?: string;
}

export default class ServerTask extends Task {
  protected async run(): Promise<ServerAddressInfo> {
    dotenv.config({
      path: this.project.rootPath + "/.env",
      silent: true
    });

    let app = await this.bootApp();
    let [key, cert] = await readSSLCerts(this.project.rootPath);

    this.startWatcher(app.container);

    return new Promise<ServerAddressInfo>((resolve, reject) => {
      let server: Server;
      let protocol: string;

      if (key && cert) {
        server = http2.createServer({ key, cert }, (request, response) => {
          app.dispatch(request, response) as any as Server;
        });
        protocol = "https";
      } else {
        server = http.createServer((request, response) => {
          app.dispatch(request as any as Application.Request, response);
        }) as any as Server;
        protocol = "http";
      }

      server.on("error", reject);

      server.on("listening", () => {
        let  info = server.address();

        resolve({
          server,
          address: info.address,
          port: info.port,
          family: info.family,
          url: urlForAddressInfo(info, protocol)
        });
      });

      server.listen(process.env.PORT || 8000);
    });
  }

  async bootApp(): Promise<Application> {
    let app = this.project.application();

    await app.boot();

    return app;
  }

  startWatcher(container: Container) {
    chokidar.watch(this.project.rootPath + "/app", {
      ignored: /[\/\\]\./,
      ignoreInitial: true
    }).on("all", (_: string, path: string) => {
      container.fileDidChange(path);
    });
  }
}

async function readSSLCerts(rootPath: string): Promise<[Buffer, Buffer]> {
  try {
    return await Promise.all<Buffer, Buffer>([
      readFile(`${rootPath}/${SSL_KEY_PATH}`),
      readFile(`${rootPath}/${SSL_CERT_PATH}`)
    ]);
  } catch (e) {
    return [null, null];
    // if (e.code === "ENOENT") {
    //   throw new SSLNotFoundError({
    //     missingFile: e.path
    //   });
    // }
  }
}

function urlForAddressInfo({ address, family, port }: ServerAddressInfo, protocol: string): string {
  if (family === "IPv6") {
    address = `[${address}]`;
  }

  return `${protocol}://${process.env.USER}.${DNS_TLD}:${port}`;
}