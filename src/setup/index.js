var nconf = require('nconf');
var fileExists = require('file-exists');
var doSetup = require('./doSetup');

const CONF_FILE_PATH = require('@justinc/drill-conf').confFilePath;

module.exports = function _setup() {
  if (!fileExists(CONF_FILE_PATH)) {
    doSetup();
  }

  nconf.file({ file: CONF_FILE_PATH });
};
