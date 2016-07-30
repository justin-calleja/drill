module.exports = {
  command: 'edit',
  desc: 'edit configuration',
  builder: {},
  handler: argv => require('./edit')(argv)
};
