var fs = require('fs');
var dirs = require('@justinc/dirs-as-promised');
const DEFAULT_MATERIAL_DIR_NAME = require('@justinc/drill-conf').defaultMaterialDirName;
var getOrDie = require('@justinc/drill-conf').getOrDie;
var path = require('path');
var glob = require('glob');
var R = require('ramda');

const CONTAINER_PATHS = getOrDie('container.paths');

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
 * @return {[type]}       [description]
 */
module.exports = (log) => {

  return Promise.all(CONTAINER_PATHS.map(dirs)).then(results => {
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

    return syncGetReadableStreams(CONTAINER_PATHS, results);
  });

};
