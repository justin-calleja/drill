#!/usr/bin/env node

require('./utils/setup')();

var nconf = require('nconf');
var os = require('os');
var path = require('path');
var fs = require('fs');
var resetWorkspace = require('./utils/resetWorkspace');
var tmp = require('./utils/tmp');

var argv = require('yargs')
  .usage('$0 <cmd> [args]')
  .help('h')
  .alias('h', 'help')
  .command('gen [no-launch-editor]', 'generates a new drill in the workspace', {
    'no-launch-editor': {
      alias: 'n',
      describe: 'used to skip launching editor in workspace',
      'default': false
    }
  }, function(argv) {
    // console.log('in gen command with noLaunchEditor:', argv['noLaunchEditor']);
    // console.log('argv:', argv);
    var workspacePath = nconf.get('workspace.path');
    // console.log('workspacePath:', workspacePath);
    resetWorkspace(workspacePath, () => {
      if (!argv['no-launch-editor']) {
        tmp(workspacePath);
      }
    });
  })
  .argv;
