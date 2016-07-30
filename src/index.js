#!/usr/bin/env node

require('@justinc/drill-conf').createConfFileIfNotExists();

require('yargs')
  .usage('$0 <cmd>')
  .commandDir('./cmds')
  .required( 1, 'At least one command is required to operate drill')
  .help()
  .version()
  .alias('version', 'v')
  .argv;
