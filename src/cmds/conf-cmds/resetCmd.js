module.exports = {
  command: 'reset',
  desc: 'resets configuration to default',
  builder: {},
  handler: argv => require('./reset')(argv)
};
