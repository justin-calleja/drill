var dirs = require('@justinc/dirs').dirs;
var async = require('async');
var getOrDie = require('@justinc/drill-conf').getOrDie;
var archy = require('archy');

const CONTAINER_PATHS = getOrDie('container.paths');

module.exports = () => {

  async.map(CONTAINER_PATHS, dirs, (err, results) => {
    if (err) throw err;
    CONTAINER_PATHS.forEach((materialPath, i) => {
      console.log(archy({
        label: materialPath,
        nodes: results[i]
      }));
    });
  });

};
