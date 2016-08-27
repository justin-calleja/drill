var launchEditor = require('@justinc/launch-editor');
var async = require('async');
var del = require('del');
var bunyan = require('bunyan');
var path = require('path');
var pickItems = require('./pickItems');

const DRILL_DIR_PATH = require('@justinc/drill-conf').drillDirPath;
const LAST_GEN_RUN_LOG_FILE_NAME = require('@justinc/drill-conf').lastGenRunLogFileName;
var getOrDie = require('@justinc/drill-conf').getOrDie;

const WORKSPACE_PATH = getOrDie('workspace.path');
const LOG_FILE_PATH = path.join(DRILL_DIR_PATH, LAST_GEN_RUN_LOG_FILE_NAME);

module.exports = function _gen(argv) {

  del.sync([ LOG_FILE_PATH ], { force: true });
  var log = bunyan.createLogger({
    name: 'drill-gen',
    streams: [ { level: argv.logLevel, path: LOG_FILE_PATH } ]
  });
  log.info(`Logging level is: ${argv.logLevel}`);

  async.parallel({
    resetWorkspace: (cb) => require('./resetWorkspace')(log, cb),
    getReadableStreams: (cb) => require('./getReadableStreams')(log, cb)
  }, function(err, results) {
    if (err) throw err;

    // console.log('results.getReadableStreams:', results.getReadableStreams);

    pickItems({ log, streams: results.getReadableStreams })
      .then(pickItemsResult => {
        console.log('pickItemsResult:', pickItemsResult);

        if (argv.editorNo) {
          console.log(`\nDone generating drill in ${WORKSPACE_PATH}\n`);
        } else if (argv.editorYes) {
          launchEditor(WORKSPACE_PATH, () => {
            console.log('TODO: read user submitted answers');
            console.log('TODO: check answers');
            console.log('TODO: write data to keep track of what was asked, when, and how the user did');
          });
        } else {
          require('@justinc/yesno')({ message: 'Do you want to open your editor in the workspace now?' }).then(answer => {
            if (answer.yes) {
              launchEditor(WORKSPACE_PATH, () => {
                console.log('TODO: read user submitted answers');
                console.log('TODO: check answers');
                console.log('TODO: write data to keep track of what was asked, when, and how the user did');
              });
            } else {
              console.log(`\nDone generating drill in ${WORKSPACE_PATH}\n`);
            }
          });
        }
      })
      .catch(err => {
        console.log('\n', err.message, '\n');
        process.exit(1);
      });
  });
};
