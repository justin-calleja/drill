var resetWorkspace = require('../workspace-cmds/reset/resetWorkspace');
var getOrDie = require('@justinc/drill-conf').getOrDie;
const Promise = require('bluebird');

const WORKSPACE_PATH = getOrDie('workspace.path');

// module.exports = (log, cb) => {
module.exports = (log) => {

  return resetWorkspace(WORKSPACE_PATH, (err, result) => {
    if (err) Promise.reject(err);

    result = result || {};
    if (result.deletedPaths) {
      result.deletedPaths.forEach(p => [ console.log, log.debug.bind(log) ].forEach(print => print(`Deleted: ${p}`)));
      return Promise.resolve(true);
      // return cb(null);
    } else if (result.userSaysNo) {
      [ console.log, log.warn.bind(log) ].forEach(print => print('\nCannot generate a drill without resetting the workspace'));
      process.exit(0);
    } else {
      return Promise.resolve(false);
      // cb(null);
    }
  });
};
