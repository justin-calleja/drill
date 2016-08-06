var levelup = require('level');
var fs = require('fs');
var dirs = require('@justinc/dirs').dirs;
var defaultMaterialDirName = require('@justinc/drill-conf').defaultMaterialDirName;
var async = require('async');
var getOrDie = require('@justinc/drill-conf').getOrDie;
var path = require('path');
var glob = require('glob');
var flatten = require('lodash.flatten');

const DB_PATH = getOrDie('db.path');
const CONTAINER_PATHS = getOrDie('container.paths');

var db = levelup(DB_PATH);

process.on('exit', (_code) => {
  db.close();
});
process.on('SIGINT', () => {
  db.close();
});
process.on('uncaughtException', (err) => {
  console.log(err);
  db.close();
  process.exit(1);
});

/**
 * Returns an array where each element is an array of length 2. Each element's first position is
 * the container name. The second position is an array of readable streams found in that container's
 * materials.
 * @param  {Function} cb  [description]
 * @param  {[type]}   log [description]
 * @return {[type]}       [description]
 */
module.exports = (cb, log) => {

  async.map(CONTAINER_PATHS, dirs, (err, results) => {
    if (err) {
      return cb(err);
    }

    var result = CONTAINER_PATHS.map((containerPath, i) => {
      log.debug(`Container path ${containerPath} has the following materials: ${results[i].join(', ')}`);
      var readableStreams = flatten(results[i].map(materialDirName => {
        var materialPath = path.join(containerPath, materialDirName, defaultMaterialDirName);
        var fileNames = null;
        try {
          fileNames = glob.sync('*.json', { cwd: materialPath });
        } catch (err) {
          console.log(err.message);
          process.exit(1);
        }

        return fileNames.map(fileName => {
          var filePath = path.join(materialPath, fileName);
          log.debug(`Streaming from ${filePath}`);
          return fs.createReadStream(filePath);
        });
      }));
      return [containerPath, readableStreams];
    });

    cb(null, result);
  });

};
