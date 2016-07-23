const CONF_FILE_CONTENTS = require('../../utils/conf').confFileContents;
const CONF_FILE_PATH = require('../../utils/conf').confFilePath;
var fs = require('fs');

module.exports = function _resetConfig(_argv) {
  fs.writeFileSync(CONF_FILE_PATH, CONF_FILE_CONTENTS);
};
