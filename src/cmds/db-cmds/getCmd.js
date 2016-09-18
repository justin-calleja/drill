module.exports = {
  command: 'get <key>',
  desc: 'gets value of given key from db',
  builder: {},
  handler: argv => require('./get')(argv)
};
