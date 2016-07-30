module.exports = {
  command: 'path',
  desc: 'prints workspace directory path',
  builder: {},
  handler: argv => require('./path')(argv)
};
