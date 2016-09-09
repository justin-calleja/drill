var dirExists = require('@justinc/dir-exists').dirExistsAsPromised;
var mkdirp = require('mkdirp-promise/lib/node6');

module.exports = (dirPath) => {

  return new Promise((resolve, reject) => {
    return dirExists(dirPath)
      .then(exists => {
        if (!exists) {
          mkdirp(dirPath)
            .then(createdPath => resolve({ createdPath }))
            .catch(reject);
        } else {
          resolve({ createdPath: null });
        }
      })
      .catch(reject);
  });

};
