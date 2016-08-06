var launchEditor = require('@justinc/launch-editor');
var generateDrill = require('./generateDrill');
var getOrDie = require('@justinc/drill-conf').getOrDie;
var async = require('async');
var resetWorkspace = require('../workspace-cmds/reset/resetWorkspace');

module.exports = function _gen(argv) {
  var workspacePath = getOrDie('workspace.path');
  var doResetWorkspace = function _doResetWorkspace(cb) {
    resetWorkspace(workspacePath, (err, result) => {
      if (err) cb(err);

      result = result || {};
      if (result.deletedPaths) {
        console.log('\nDeleted the following:');
        result.deletedPaths.forEach(p => console.log(p));
        console.log();
        return cb(null);
      } else if (result.userSaysNo) {
        console.log('\nCannot generate a drill without resetting the workspace');
        process.exit(0);
      } else {
        cb(null);
      }
    });
  };

  async.parallel([doResetWorkspace, generateDrill], function(err, results) {
    if (err) throw err;

    console.log('results:', results);

    // console.log('argv:', JSON.stringify(argv, null, 2));

    if (!argv['skip-edit']) {
      launchEditor(workspacePath, () => {
        console.log('TODO: read user submitted answers');
        console.log('TODO: check answers');
        console.log('TODO: write data to keep track of what was asked, when, and how the user did');
      });
    }
  });
};
