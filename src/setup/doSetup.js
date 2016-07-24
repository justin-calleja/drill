var fs = require('fs');
var dirExistsSync = require('@justinc/dir-exists').dirExistsSync;

const DRILL_DIR_PATH = require('../utils/conf').drillDirPath;
const CONF_FILE_PATH = require('../utils/conf').confFilePath;
const CONF = require('../utils/conf').confStr;

module.exports = function _doSetup() {
  if (!dirExistsSync(DRILL_DIR_PATH)) {
    fs.mkdirSync(DRILL_DIR_PATH);
  }
  fs.writeFileSync(CONF_FILE_PATH, CONF);
};
