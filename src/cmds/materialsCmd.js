module.exports = {
  command: 'materials <cmd>',
  desc: 'houses commands related to materials',
  builder: function _confBuilder(yargs) {
    return yargs.commandDir('materials-cmds');
  },
  handler: _argv => {}
};
