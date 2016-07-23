var nconf = require('nconf');
var columnify = require('columnify');

module.exports = function _lsconf(_argv) {
  console.log(columnify({
    'workspace.path': nconf.get('workspace.path'),
    'db.path': nconf.get('db.path'),
    'materials.paths': nconf.get('materials.paths')
  }));
};
