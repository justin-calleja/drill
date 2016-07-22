var fs = require('fs');
var conf = require('../utils/conf');

module.exports = function drillDirExists() {
  try {
    var stats = fs.statSync(conf.drillDirPath());
  } catch (e) {
    if (e.code === 'ENOENT') {
      return false;
    } else {
      throw e;
    }
  }
  return stats.isDirectory();
};
