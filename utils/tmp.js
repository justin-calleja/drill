const spawn = require('child_process').spawn;

module.exports = function(workspacePath) {
  var editor = process.env.EDITOR || 'vi';

  var child = spawn(editor, [workspacePath], {
    stdio: 'inherit'
  });

  child.on('exit', function (e, code) {
    console.log("finished");
  });
};
