var resetWorkspace = require('../workspace-cmds/reset/resetWorkspace');
var getOrDie = require('@justinc/drill-conf').getOrDie;

const WORKSPACE_PATH = getOrDie('workspace.path');

module.exports = (log, cb) => {

  resetWorkspace(WORKSPACE_PATH, (err, result) => {
    if (err) cb(err);

    result = result || {};
    if (result.deletedPaths) {
      result.deletedPaths.forEach(p => [ console.log, log.debug.bind(log) ].forEach(print => print(`Deleted: ${p}`)));
      return cb(null);
    } else if (result.userSaysNo) {
      [ console.log, log.warn.bind(log) ].forEach(print => print('\nCannot generate a drill without resetting the workspace'));
      process.exit(0);
    } else {
      cb(null);
    }
  });
};
