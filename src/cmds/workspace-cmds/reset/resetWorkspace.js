var promptDel = require('@justinc/prompt-del');
var dirExists = require('@justinc/dir-exists').dirExists;
var mkdirp = require('mkdirp');
var chalk = require('chalk');
var path = require('path');
var emptyDir = require('empty-dir');

module.exports = (workspacePath, cb) => {
  dirExists(workspacePath, (err, exists) => {
    if (err) cb(err);

    if (exists) {
      emptyDir(workspacePath, (err, isEmpty) => {
        if (err) cb(err);

        if (!isEmpty) {
          var patterns = [path.join(workspacePath, '**'), '!' + workspacePath];
          var promptMsg = chalk.red('About to delete workspace!') + `\nPatterns to delete by:\n${patterns}`;
          promptDel({ patterns, promptMsg }, cb);
        }
        // empty workspace, nothing to reset
        return cb(null);
      });
    } else {
      // workspace does not exist, so create it
      return mkdirp(workspacePath, cb);
    }
  });
};
