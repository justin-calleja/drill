#!/usr/bin/env node

require('./setup')();

var compare = require('./utils/compare');
var commands = require('./commands');
var sortedCommands = commands.sort((a, b) => compare(a.txt, b.txt));

function addCommands(yargsConf, cmds) {
  cmds.forEach(cmd => {
    yargsConf.command(cmd.txt, cmd.desc, cmd.opts, cmd.fun);
  });
  return yargsConf;
}

addCommands(require('yargs'), sortedCommands)
  .usage('$0 <cmd>')
  .required( 1, 'At least one command is required to operate drill')
  .help()
  // .epilog( 'Link to submit issues / feature requests?')
  .argv;
