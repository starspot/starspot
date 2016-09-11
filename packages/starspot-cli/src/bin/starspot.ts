#!/usr/bin/env node

import * as resolve from "resolve";
import _CLI from "../cli";

resolve("starspot-cli", {
  basedir: process.cwd()
}, function(error, projectLocalCli) {
  let CLI: typeof _CLI;

  if (error) {
    // If there is an error, resolve could not find the ember-cli
    // library from a package.json. Instead, include it from a relative
    // path to this script file (which is likely a globally installed
    // npm package). Most common cause for hitting this is `starspot new`.
    CLI = require("../cli").default;
  } else {
    // No error implies a projectLocalCli, which will load whatever
    // version of ember-cli you have installed in a local package.json
    CLI = require(projectLocalCli).CLI;
  }

  let cli = new CLI();
  cli.run()
    .catch(e => {
      console.log(e);
    });
});
