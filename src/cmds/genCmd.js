var del = require('del');
var bunyan = require('bunyan');
var path = require('path');
const LOGS_DIR_PATH = require('@justinc/drill-conf').logsDirPath;
const ensureDirExists = require('../ensureDirExists');
const LOG_FILE_PATH = path.join(LOGS_DIR_PATH, 'gen.log');

module.exports = {
  command: 'gen [opts]',
  desc: 'generates a new drill in the workspace',
  builder: {
    'editor-yes': {
      describe: 'Open generated file in editor after drill gen is complete'
    },
    'editor-no': {
      describe: 'Do not open generated file in editor after drill gen is complete'
    },
    'log-level': {
      describe: 'Used to set the log level',
      'default': 'info'
    }
  },
  handler: argv => {
    ensureDirExists(LOGS_DIR_PATH)
      .then(() => del([ LOG_FILE_PATH ], { force: true }))
      .then(() => {
        var log = bunyan.createLogger({
          name: 'drill-gen',
          streams: [ { level: argv.logLevel, path: LOG_FILE_PATH } ]
        });
        log.info(`Logging level is: ${argv.logLevel}`);

        require('./gen')(argv, { log });
      });
  }
};
