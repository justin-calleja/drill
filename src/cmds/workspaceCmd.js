module.exports = {
  command: 'workspace <cmd>',
  desc: 'houses commands related to workspace',
  builder: function _confBuilder(yargs) {
    return yargs.commandDir('workspace-cmds');
  },
  handler: _argv => {}
};
