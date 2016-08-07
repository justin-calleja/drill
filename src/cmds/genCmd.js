module.exports = {
  command: 'gen [no-launch-editor]',
  desc: 'generates a new drill in the workspace',
  builder: {
    'editor-yes': {
      describe: 'Launch editor in workspace after drill gen is complete'
    },
    'editor-no': {
      describe: 'Do not launch editor in workspace after drill gen is complete'
    },
    'log-level': {
      describe: 'Used to set the log level',
      'default': 'info'
    }
  },
  handler: argv => require('./gen')(argv)
};
