var dirs = require('@justinc/dirs').dirs;
var async = require('async');
var nconf = require('nconf');
var archy = require('archy');

const MATERIALS_PATHS = nconf.get('materials.paths');

module.exports = () => {

  async.map(MATERIALS_PATHS, dirs, (err, results) => {
    if (err) throw err;
    MATERIALS_PATHS.forEach((materialsPath, i) => {
      console.log(archy({
        label: materialsPath,
        nodes: results[i]
      }));
    });
  });

};
