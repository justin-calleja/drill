const CONF = require('@justinc/drill-conf').confStr;
const CONF_FILE_PATH = require('@justinc/drill-conf').confFilePath;
var fs = require('fs');

module.exports = function _resetConfig(_argv) {
  fs.writeFileSync(CONF_FILE_PATH, CONF);
};
