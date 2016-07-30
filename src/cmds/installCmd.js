module.exports = {
  command: 'install <url> [name] [head]',
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
  builder: {},
  handler: argv => require('./install')(argv)
};
