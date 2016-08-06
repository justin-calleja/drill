var levelup = require('level');
var dirs = require('@justinc/dirs').dirs;
var defaultMaterialDirName = require('@justinc/drill-conf').defaultMaterialDirName;
var async = require('async');
var getOrDie = require('@justinc/drill-conf').getOrDie;
var path = require('path');

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

module.exports = function _generateDrill(cb) {

  async.map(CONTAINER_PATHS, dirs, (err, results) => {
    if (err) {
      return cb(err);
    }

    CONTAINER_PATHS.forEach((containerPath, i) => {
      results[i].forEach(materialDirName => {
        var materialPath = path.join(containerPath, materialDirName, defaultMaterialDirName);
        // console.log('>', materialPath);
      });
    });

    cb(null, 'mehmeh');
  });

};
