var resetWorkspace = require('../../utils/resetWorkspace');
var tmp = require('../../utils/tmp');
var nconf = require('nconf');

module.exports = function _gen(argv) {
  // console.log('in gen command with noLaunchEditor:', argv['noLaunchEditor']);
  // console.log('argv:', argv);
  var workspacePath = nconf.get('workspace.path');
  // console.log('workspacePath:', workspacePath);
  resetWorkspace(workspacePath, () => {
    if (!argv['no-launch-editor']) {
      tmp(workspacePath);
    }
  });
};
