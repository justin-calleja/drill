#!/usr/bin/env node

var meow = require('meow');
var nconf = require('nconf');
var os = require('os');
var path = require('path');
var fs = require('fs');
var configDirExists = require('./utils/configDirExists');
var createDefaultConfigDir = require('./utils/createDefaultConfigDir');
var conf = require('./utils/conf');
var resetWorkspace = require('./utils/resetWorkspace');
var tmp = require('./utils/tmp');

const cli = meow(`
    Usage:
        $ drill
        -h, --help            print usage information
        -v, --version         show version info and exit
`, {
  alias: {
    v: 'version',
    h: 'help'
  }
});

var exists = configDirExists();
if (!exists) {
  createDefaultConfigDir();
}

nconf.argv()
  .env()
  .file({ file: conf.confFilePath() });

// var repl = require('repl');
// var replServer = repl.start({
//   prompt: '> ',
// });
// replServer.context.nconf = nconf;
// debugger;

var workspacePath = nconf.get('workspace.path');

resetWorkspace(workspacePath, () => {
  tmp(workspacePath);
  // console.log('process.cwd():', process.cwd());
  // process.chdir(workspacePath);
  // console.log('process.cwd():', process.cwd());
});
