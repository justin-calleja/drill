module.exports = {
  command: 'path',
  desc: 'prints drill directory path',
  builder: {},
  handler: argv => require('./path')(argv)
};
