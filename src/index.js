#!/usr/bin/env node

require('./setup')();

var gen = require('./commands/gen');
var install = require('./commands/install');
var lsconf = require('./commands/lsconf');
var rconf = require('./commands/rconf');
var econf = require('./commands/econf');
var pathCmd = require('./commands/path');
var lsmaterials = require('./commands/lsmaterials');

require('yargs')
  .usage('$0 <cmd>')
  .command('install <url> [name] [head]', 'installs material from given url', {
    url: {
      alias: 'u',
      describe: 'The url to use to install into the head materials path'
    },
    name: {
      alias: 'n',
      describe: 'The name to clone to'
    },
    head: {
      alias: 'h',
      describe: 'Use the head materials path to install into even if there are multiple materials paths'
    }
  }, install)
  .command('gen [no-launch-editor]', 'generates a new drill in the workspace', {
    'no-launch-editor': {
      alias: 'n',
      describe: 'Used to skip launching editor in workspace',
      'default': false
    }
  }, gen)
  .command('lsconf', 'list configuration', {}, lsconf)
  .command('rconf', 'resets config to default', rconf)
  .command('econf', 'edit config', econf)
  .command('path', 'prints drill directory path', pathCmd)
  .command('lsmaterials', 'list available materials', lsmaterials)
  .required( 1, 'At least one command is required to operate drill')
  .help()
  // .epilog( 'Link to submit issues / feature requests?')
  .argv;
