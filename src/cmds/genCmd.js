module.exports = {
  command: 'gen [no-launch-editor]',
  desc: 'generates a new drill in the workspace',
  builder: {
    'editor-yes': {
      describe: 'Open generated file in editor after drill gen is complete'
    },
    'editor-no': {
      describe: 'Do not open generated file in editor after drill gen is complete'
    },
    'log-level': {
      describe: 'Used to set the log level',
      'default': 'info'
    }
  },
  handler: argv => require('./gen')(argv)
};
