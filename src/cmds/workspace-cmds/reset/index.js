var getOrDie = require('@justinc/drill-conf').getOrDie;
var resetWorkspace = require('./resetWorkspace');

var workspacePath = getOrDie('workspace.path');

module.exports = function _reset(_argv) {
  resetWorkspace(workspacePath, (err, result) => {
    if (err) throw err;
    if (result.deletedPaths) {
      console.log('Deleted the following:\n');
      result.deletedPaths.forEach(p => console.log(p));
    }
  });
};
