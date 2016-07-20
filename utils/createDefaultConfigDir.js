var fs = require('fs');
var conf = require('./conf');

module.exports = function createDefaultConfigDir() {
  fs.mkdirSync(conf.confDirPath());
  fs.writeFileSync(conf.confFilePath(), conf.confFileContents());
};
