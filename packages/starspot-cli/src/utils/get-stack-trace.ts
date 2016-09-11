export interface CallSite {
  getFileName(): string;
}

export interface PrepareStackTrace {
  (error: Error, stackTrace: CallSite[]): CallSite[];
}

declare global {
  interface ErrorConstructor {
    prepareStackTrace: PrepareStackTrace;
  }
}

export default function(depth: number) {
  let pst: PrepareStackTrace;
  let stack: CallSite[];
  let file: string;

  pst = Error.prepareStackTrace;
  Error.prepareStackTrace = function (_, stack) {
      Error.prepareStackTrace = pst;
      return stack;
  };

  stack = (new Error()).stack as any as CallSite[];
  depth = !depth || isNaN(depth) ? 1 : (depth > stack.length - 2 ? stack.length - 2 : depth);
  stack = stack.slice(depth + 1);

  do {
      let frame = stack.shift();
      file = frame && frame.getFileName();
  } while (stack.length && file === "module.js");

  return file;
}