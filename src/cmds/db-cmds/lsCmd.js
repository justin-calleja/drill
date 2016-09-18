module.exports = {
  command: 'ls',
  desc: 'lists all keys in the db',
  builder: {},
  handler: argv => require('./ls')(argv)
};
