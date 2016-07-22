var fs = require('fs');
var dirExists = require('@justinc/dir-exists');

const DRILL_DIR_PATH = require('../utils/conf').drillDirPath();
const CONF_FILE_PATH = require('../utils/conf').confFilePath();
const CONF_FILE_CONTENTS = require('../utils/conf').confFileContents();

module.exports = function _doSetup() {
  if (!dirExists(DRILL_DIR_PATH)) {
    fs.mkdirSync(DRILL_DIR_PATH);
  }
  fs.writeFileSync(CONF_FILE_PATH, CONF_FILE_CONTENTS);
};
