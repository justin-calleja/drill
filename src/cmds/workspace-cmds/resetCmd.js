module.exports = {
  command: 'reset',
  desc: 'Resets workspace: deletes workspace contents and re-creates workspace. Creates workspace if it does not exist',
  builder: {},
  handler: argv => require('./reset')(argv)
};
