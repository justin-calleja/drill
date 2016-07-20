var nconf = require('nconf');
var configDirExists = require('./configDirExists');
var createDefaultConfigDir = require('./createDefaultConfigDir');
var conf = require('./conf');

module.exports = function _setup() {
  if (!configDirExists()) {
    createDefaultConfigDir();
  }

  nconf.env()
    .file({ file: conf.confFilePath() });
};
