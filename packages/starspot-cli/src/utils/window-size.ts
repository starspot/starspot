import * as _tty from "tty";

/*!
 * Adapted from:
 * window-size <https://github.com/jonschlinkert/window-size>
 *
 * Copyright (c) 2014-2015 Jon Schlinkert
 * Licensed under the MIT license.
 */

export default function () {
  let width: number;
  let height: number;

  let stdout: any = process.stdout;
  let tty: any = _tty;

  if (tty.isatty(1) && tty.isatty(2)) {
    if (stdout.getWindowSize) {
      width = stdout.getWindowSize(1)[0];
      height = stdout.getWindowSize(1)[1];
    } else if (tty.getWindowSize) {
      width = tty.getWindowSize()[1];
      height = tty.getWindowSize()[0];
    } else if (stdout.columns && stdout.rows) {
      height = stdout.rows;
      width = stdout.columns;
    }
  } else {
    Error("window-size could not get size with tty or stdout.");
  }

  return { height: height, width: width };
};