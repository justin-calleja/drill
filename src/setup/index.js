var nconf = require('nconf');
var fileExists = require('file-exists');
var doSetup = require('./doSetup');

const CONF_FILE_PATH = require('../utils/conf').confFilePath();

module.exports = function _setup() {
  if (!fileExists(CONF_FILE_PATH)) {
    doSetup();
  }

  nconf.env()
    .file({ file: CONF_FILE_PATH });
};
