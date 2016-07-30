module.exports = {
  command: 'ls',
  desc: 'lists configuration',
  builder: {},
  handler: argv => require('./ls')(argv)
};
