var path = require('path');
var os = require('os');
var fs = require('fs');

module.exports = function configDirExists() {
  var configPath = path.join(os.homedir(), '.qsetup') ;
  try {
    var stats = fs.statSync(configPath);
  } catch (e) {
    if (e.code === 'ENOENT') {
      return false;
    } else {
      throw e;
    }
  }
  return stats.isDirectory();
};
