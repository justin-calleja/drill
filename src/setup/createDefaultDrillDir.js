var fs = require('fs');
var conf = require('../utils/conf');

module.exports = function createDefaultDrillDir() {
  fs.mkdirSync(conf.drillDirPath());
  fs.writeFileSync(conf.confFilePath(), conf.confFileContents());
};
