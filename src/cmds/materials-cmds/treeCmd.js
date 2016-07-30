module.exports = {
  command: 'tree',
  desc: 'displays materials directories (in all known containers) as trees',
  builder: {},
  handler: argv => require('./tree')(argv)
};
