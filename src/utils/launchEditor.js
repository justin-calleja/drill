const spawn = require('child_process').spawn;

module.exports = function(workspacePath, onExitCb) {
  var editor = process.env.EDITOR || 'vi';

  var child = spawn(editor, [workspacePath], {
    stdio: 'inherit'
  });

  child.on('exit', function(_code) {
    // it's always finishing with code 1
    onExitCb();
  });
};
