const spawn = require('child_process').spawn;

module.exports = function(pathToOpenEditorIn, onExitCb) {
  var editor = process.env.EDITOR || 'vi';

  var child = spawn(editor, [pathToOpenEditorIn], {
    stdio: 'inherit'
  });

  child.on('exit', function(_code) {
    // it's always finishing with code 1
    if (onExitCb) {
      onExitCb();
    }
  });
};
