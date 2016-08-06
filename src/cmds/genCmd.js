module.exports = {
  command: 'gen [no-launch-editor]',
  desc: 'generates a new drill in the workspace',
  builder: {
    'skip-edit': {
      alias: 's',
      describe: 'Used to skip launching editor in workspace',
      'default': false
    },
    'log-level': {
      describe: 'Used to set the log level',
      'default': 'info'
    }
  },
  handler: argv => require('./gen')(argv)
};
