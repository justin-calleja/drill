module.exports = {
  command: 'restore [file]',
  desc: 'loads all items from dump file in db',
  builder: {
    'force': {
      describe: 'Overwrite existing items in db with the same ids as items found in dump file'
    }
  },
  handler: argv => require('./restore')(argv)
};
