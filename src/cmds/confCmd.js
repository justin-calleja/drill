module.exports = {
  command: 'conf <cmd>',
  desc: 'houses commands related to configuration',
  builder: function _confBuilder(yargs) {
    return yargs.commandDir('conf-cmds');
  },
  handler: _argv => {}
};
