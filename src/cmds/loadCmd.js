var del = require('del');
var bunyan = require('bunyan');
var path = require('path');
const LOGS_DIR_PATH = require('@justinc/drill-conf').logsDirPath;
const ensureDirExists = require('../ensureDirExists');
const LOG_FILE_PATH = path.join(LOGS_DIR_PATH, 'load.log');
const db = require('../dbConnection');

module.exports = {
  command: 'load [opts]',
  desc: 'loads data from files to db',
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
          name: 'drill-load',
          streams: [ { level: argv.logLevel, path: LOG_FILE_PATH } ]
        });
        log.info(`Logging level is: ${argv.logLevel}`);

        require('./load')(argv, { log, db });
      });
  }
};
