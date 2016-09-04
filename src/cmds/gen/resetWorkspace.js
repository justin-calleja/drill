var resetWorkspace = require('../workspace-cmds/reset/resetWorkspace');
var getOrDie = require('@justinc/drill-conf').getOrDie;

const WORKSPACE_PATH = getOrDie('workspace.path');

module.exports = (log) => {

  return resetWorkspace(WORKSPACE_PATH).then(({ workspaceState, deletedPaths }) => {
    if (deletedPaths.length > 0) {
      console.log('---');
      deletedPaths.forEach(p => [ console.log, log.debug.bind(log) ].forEach(print => print(`Deleted: ${p}`)));
      console.log('---');
    }

    if (workspaceState === 'not-empty' && deletedPaths.length === 0) {
      let msg = 'Cannot generate a drill without resetting the workspace';
      console.log('\n' + msg);
      log.warn(msg);
      return process.exit(0);
    }

    return true;
  });

};
