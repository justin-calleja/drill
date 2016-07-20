var fs = require('fs');
var conf = require('./conf');

module.exports = function configDirExists() {
  try {
    var stats = fs.statSync(conf.confDirPath());
  } catch (e) {
    if (e.code === 'ENOENT') {
      return false;
    } else {
      throw e;
    }
  }
  return stats.isDirectory();
};
