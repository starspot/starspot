declare module "http2" {
  import * as http from "http";
  import * as https from "https";

  interface ServerOptions extends https.ServerOptions { }
  interface Server extends https.Server { }
  interface IncomingMessage extends http.IncomingMessage {
    method: string;
    url: string;
  }
  interface ServerResponse extends http.ServerResponse { }

  export function createServer(options: ServerOptions, listener?: (req: IncomingMessage, res: ServerResponse) => void): Server;
}