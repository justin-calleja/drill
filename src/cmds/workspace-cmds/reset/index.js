var getOrDie = require('@justinc/drill-conf').getOrDie;
var resetWorkspace = require('./resetWorkspace');

var workspacePath = getOrDie('workspace.path');

module.exports = function _reset(_argv) {

  resetWorkspace(workspacePath).then(({ deletedPaths, createdPaths }) => {
    if (deletedPaths.length > 0) {
      console.log('Deleted the following:\n');
      deletedPaths.forEach(p => console.log(p));
    }

    if (createdPaths.length > 0) {
      console.log('Created the following:\n');
      createdPaths.forEach(p => console.log(p));
    }

    if (createdPaths.length === 0 && deletedPaths.length === 0) {
      console.log('\nNo changes made\n');
    }
  });

};
