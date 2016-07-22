var fs = require('fs');

module.exports = function _dirExists(dirPath) {
  try {
    var stats = fs.statSync(dirPath);
    return stats.isDirectory();
  } catch (e) {
    if (e.code === 'ENOENT') {
      return false;
    } else {
      throw e;
    }
  }
};
