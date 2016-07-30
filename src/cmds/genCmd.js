module.exports = {
  command: 'gen [no-launch-editor]',
  desc: 'generates a new drill in the workspace',
  opts: {
    'no-launch-editor': {
      alias: 'n',
      describe: 'Used to skip launching editor in workspace',
      'default': false
    }
  },
  builder: {},
  handler: argv => require('./gen')(argv)
};
