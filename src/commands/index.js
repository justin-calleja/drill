var install = require('./install');
var gen = require('./gen');
var lsconf = require('./lsconf');
var rconf = require('./rconf');
var econf = require('./econf');
var pathCmd = require('./path');
var lsmaterials = require('./lsmaterials');

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
    fun: install
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
    fun: gen
  },
  {
    txt: 'lsconf',
    desc: 'list configuration',
    opts: {},
    fun: lsconf
  },
  {
    txt: 'rconf',
    desc: 'resets configuration to default',
    opts: {},
    fun: rconf
  },
  {
    txt: 'econf',
    desc: 'edit configuration',
    opts: {},
    fun: econf
  },
  {
    txt: 'path',
    desc: 'prints drill directory path',
    opts: {},
    fun: pathCmd
  },
  {
    txt: 'lsmaterials',
    desc: 'list available materials',
    opts: {},
    fun: lsmaterials
  }
];
