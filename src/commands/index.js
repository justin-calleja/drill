// Commands are required in fun so they can be wrapped around an anon function.
// This prevents each command's files to be evaluated unless the user asks for that specific command.
module.exports = [
  {
    txt: 'install <url> [name] [head]',
    desc: 'installs material from given url',
    opts: {
      url: {
        alias: 'u',
        describe: 'The url to use to install into the head materials path'
      },
      name: {
        alias: 'n',
        describe: 'The name to clone to'
      },
      head: {
        alias: 'h',
        describe: 'Use the head container path to install into even if there are multiple container paths'
      }
    },
    fun: argv => require('./install')(argv)
  },
  {
    txt: 'gen [no-launch-editor]',
    desc: 'generates a new drill in the workspace',
    opts: {
      'no-launch-editor': {
        alias: 'n',
        describe: 'Used to skip launching editor in workspace',
        'default': false
      }
    },
    fun: argv => require('./gen')(argv)
  },
  {
    txt: 'lsconf',
    desc: 'list configuration',
    opts: {},
    fun: argv => require('./lsconf')(argv)
  },
  {
    txt: 'rconf',
    desc: 'resets configuration to default',
    opts: {},
    fun: argv => require('./rconf')(argv)
  },
  {
    txt: 'econf',
    desc: 'edit configuration',
    opts: {},
    fun: argv => require('./econf')(argv)
  },
  {
    txt: 'path',
    desc: 'prints drill directory path',
    opts: {},
    fun: argv => require('./path')(argv)
  },
  {
    txt: 'lsmaterials',
    desc: 'list available materials',
    opts: {},
    fun: argv => require('./lsmaterials')(argv)
  }
];
