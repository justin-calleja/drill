module.exports = {
  command: 'dump [file]',
  desc: 'dumps the db to a file (default file is ./dump.json)',
  builder: {},
  handler: argv => require('./dump')(argv)
};
