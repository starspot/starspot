declare module "native-dns" {
  import { EventEmitter } from "events";

  interface ARecord { }

  interface Request {
    answer: ARecord[];
  }

  interface Server extends EventEmitter {
    on(event: "request", cb: (req: any, res: any) => void): this;
    serve(port: number): void;
  }

  interface AOptions {
    name: string,
    address: string,
    ttl: number
  }

  export function A(options: AOptions): ARecord;
  export function createServer(): Server;
}
