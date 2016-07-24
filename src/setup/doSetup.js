var fs = require('fs');
var dirExistsSync = require('@justinc/dir-exists').dirExistsSync;

const c = require('@justinc/drill-conf');
const DRILL_DIR_PATH = c.drillDirPath;
const CONF_FILE_PATH = c.confFilePath;
const CONF = c.confStr;

module.exports = function _doSetup() {
  if (!dirExistsSync(DRILL_DIR_PATH)) {
    fs.mkdirSync(DRILL_DIR_PATH);
  }
  fs.writeFileSync(CONF_FILE_PATH, CONF);
};
