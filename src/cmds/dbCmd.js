module.exports = {
  command: 'db <cmd>',
  desc: 'houses commands related to db',
  builder: function _confBuilder(yargs) {
    return yargs.commandDir('db-cmds');
  },
  handler: _argv => {}
};
