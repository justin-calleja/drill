var levelup = require('level');
var dirs = require('@justinc/dirs').dirs;
var defaultMaterialDirName = require('@justinc/drill-conf').defaultMaterialDirName;
var async = require('async');
var getOrDie = require('@justinc/drill-conf').getOrDie;

const DB_PATH = getOrDie('db.path');

var db = null;
try {
  db = levelup(DB_PATH);
} catch (e) {
  console.log(e);
}
var path = require('path');

const CONTAINER_PATHS = getOrDie('container.paths');

module.exports = function _generateDrill() {

  async.map(CONTAINER_PATHS, dirs, (err, results) => {
    if (err) throw err;
    CONTAINER_PATHS.forEach((containerPath, i) => {
      results[i].forEach(materialDirName => {
        var materialPath = path.join(containerPath, materialDirName, defaultMaterialDirName);
        console.log(materialPath);
      });

      // materialsPath, results[i]
    });
  });


  // db.get('', (err, value) => {
  //   if (err) {
  //
  //   }
  // });

};
