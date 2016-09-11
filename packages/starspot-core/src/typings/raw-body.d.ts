declare module "raw-body" {
  import { Readable } from "stream";

  interface RawBodyOptions {
    /** The length of the stream. If the contents of the stream do not add up to
     *  this length, an 400 error code is returned. */
    length?: number;
    /** limit - The byte limit of the body. If the body ends up being larger
    than this limit, a 413 error code is returned. */
    limit?: number;
    // encoding - The requested encoding. By default, a Buffer instance
    // will be returned. Most likely, you want utf8. You can use any type of
    // encoding supported by iconv-lite. You can also pass a string in place of
    // options to just specify the encoding.
    encoding?: string;
  }

  function getRawBody(stream: Readable): Promise<Buffer>;
  function getRawBody(stream: Readable, options: RawBodyOptions): Promise<Buffer>;
  function getRawBody(stream: Readable, options: RawBodyOptions, cb: (err: Error, buf: Buffer) => void): void;

  export = getRawBody;
}