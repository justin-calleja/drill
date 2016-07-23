var dirExistsSync = require('@justinc/dir-exists').dirExistsSync;
var fs = require('extfs');
var mkdirp = require('mkdirp');
var del = require('del');
var chalk = require('chalk');
var inquirer = require('inquirer');
var path = require('path');

function confirmFileDeletion(delPatterns) {
  return inquirer.prompt([
    {
      type: 'confirm',
      name: 'okDelete',
      message: chalk.red('About to delete current drill workspace:\n') + delPatterns,
      'default': false
    }
  ]);
}

function answersHandlerFactory(onOkDelete, onNotOkDelete) {
  return function answersHandler(answers) {
    answers.okDelete ? onOkDelete() : onNotOkDelete();
  };
}

module.exports = function resetWorkspace(workspacePath, cb) {
  if (dirExistsSync(workspacePath)) {
    if (!fs.isEmptySync(workspacePath)) {
      const DEL_PATTERNS = [path.join(workspacePath, '**'), '!' + workspacePath];
      confirmFileDeletion(DEL_PATTERNS).then(answersHandlerFactory(
          function onOk() {
            del(DEL_PATTERNS, {
              force: true
            }).then(paths => cb(null, paths));
          },
          function onNotOk() {
            cb(null);
          }
        ));
      return;
    }
    // workspacePath is empty:
    cb(null);
    return;
  } else {
    // workspacePath does not exist, so create it:
    mkdirp.sync(workspacePath);
    cb(null);
    return;
  }
};
