var nconf = require('nconf');
var drillDirExists = require('./drillDirExists');
var createDefaultDrillDir = require('./createDefaultDrillDir');
var conf = require('../utils/conf');

module.exports = function _setup() {
  if (!drillDirExists()) {
    createDefaultDrillDir();
  }

  nconf.env()
    .file({ file: conf.confFilePath() });
};
