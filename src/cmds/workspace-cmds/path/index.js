var getOrDie = require('@justinc/drill-conf').getOrDie;

var workspacePath = getOrDie('workspace.path');

module.exports = function _path() {
  console.log(workspacePath);
};
