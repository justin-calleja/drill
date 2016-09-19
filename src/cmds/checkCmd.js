var del = require('del');
var bunyan = require('bunyan');
var path = require('path');
const ensureDirExists = require('../ensureDirExists');
const LOGS_DIR_PATH = require('@justinc/drill-conf').logsDirPath;
const LOG_FILE_PATH = path.join(LOGS_DIR_PATH, 'check.log');

module.exports = {
  command: 'check [opts]',
  desc: 'checks the answers in generated file',
  builder: {
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
          name: 'drill-check',
          streams: [ { level: argv.logLevel, path: LOG_FILE_PATH } ]
        });
        log.info(`Logging level is: ${argv.logLevel}`);

        require('./check')(argv, { log });
      });
  }
};
