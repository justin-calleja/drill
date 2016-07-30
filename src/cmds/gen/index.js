var promptDel = require('@justinc/prompt-del');
var dirExists = require('@justinc/dir-exists').dirExists;
var path = require('path');
var chalk = require('chalk');
var launchEditor = require('@justinc/launch-editor');
var generateDrill = require('./generateDrill');
var getOrDie = require('@justinc/drill-conf').getOrDie;
var async = require('async');

module.exports = function _gen(argv) {
  var workspacePath = getOrDie('workspace.path');
  var doResetWorkspace = function _doResetWorkspace(cb) {
    dirExists(workspacePath, (err, exists) => {
      if (err) cb(err);
      if (exists) {
        var patterns = [path.join(workspacePath, '**'), '!' + workspacePath];
        var promptMsg = chalk.red('About to delete workspace!') + `\nPatterns to delete by:\n${patterns}`;
        promptDel({ patterns, promptMsg }, cb);
      } else {

      }
    });
  };
  var doGenerateDrill = function _doGenerateDrill(cb) {
    generateDrill(cb);
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
