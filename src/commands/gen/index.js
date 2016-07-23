var resetWorkspace = require('../../utils/resetWorkspace');
var launchEditor = require('../../utils/launchEditor');
var nconf = require('nconf');
var async = require('async');

module.exports = function _gen(argv) {
  var workspacePath = nconf.get('workspace.path');
  var doResetWorkspace = function _doResetWorkspace(cb) {
    resetWorkspace(workspacePath, () => {
      cb(null);
    });
  };

  async.parallel([doResetWorkspace, doGenerateDrill], function _genDone() {
    if (!argv['no-launch-editor']) {
      launchEditor(workspacePath, () => {
        console.log('TODO: read user submitted answers');
        console.log('TODO: check answers');
        console.log('TODO: write data to keep track of what was asked, when, and how the user did');
      });
    }
  });
};
