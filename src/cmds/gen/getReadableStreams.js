var levelup = require('level');
var fs = require('fs');
var dirs = require('@justinc/dirs').dirs;
const DEFAULT_MATERIAL_DIR_NAME = require('@justinc/drill-conf').defaultMaterialDirName;
var async = require('async');
var getOrDie = require('@justinc/drill-conf').getOrDie;
var path = require('path');
var glob = require('glob');
var R = require('ramda');

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
 * @param  {string} absPath    The absolute path to look for JSON files in
 * @return {Mabye([string])}   An array of filenames
 */
function syncGetAllJSONFileNamesOrDie(absPath) {
  var fileNames = null;
  try {
    fileNames = glob.sync('*.json', { cwd: absPath });
  } catch (err) {
    console.log(err.message);
    process.exit(1);
  }
  return fileNames;
}

/**
 * @param  {[type]}   log [description]
 * @param  {Function} cb  [description]
 * @return {[type]}       [description]
 */
module.exports = (log, cb) => {

  async.map(CONTAINER_PATHS, dirs, (err, results) => {
    if (err) return cb(err);

    var syncGetReadableStreams = R.compose(
      R.map(fs.createReadStream),
      R.chain(([ absPath, fileNames ]) => fileNames.map(name => path.join(absPath, name))),
      R.tap(R.forEach(([ absPath, fileNames ]) => log.debug(`Streaming from ${absPath + path.sep}{${fileNames.join(', ')}}`))),
      R.map(absPath => [absPath, syncGetAllJSONFileNamesOrDie(absPath)]),
      R.chain(([ containerPath, dirNames ]) => {
        return dirNames.map(dirName => path.join(containerPath, dirName, DEFAULT_MATERIAL_DIR_NAME));
      }),
      R.tap(R.forEach(([
        containerPath,
        dirNames
      ]) => log.debug(`Materials at '${containerPath}': ${dirNames.join(', ')}`))),
      R.zipWith((a, b) => [a, b])
    );

    return cb(null, syncGetReadableStreams(CONTAINER_PATHS, results));
  });

};
