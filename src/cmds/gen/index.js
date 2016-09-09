var launchEditor = require('@justinc/launch-editor');
var del = require('del');
var bunyan = require('bunyan');
var path = require('path');
var streamToCache = require('./streamToCache');
var itemsToQuestionsAsString = require('./itemsToQuestionsAsString');
const fs = require('fs');
const Promise = require('bluebird');
const db = require('./dbConnection');

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

  Promise.all([
    require('./resetWorkspace')(log),
    require('./getReadableStreams')(log)
  ])
    .then(([_resetWorkspaceResult, getReadableStreamsResult]) => {
      return Promise.all(
        getReadableStreamsResult.map(stream => streamToCache({ log, stream, db }))
      );
    })
    .then(caches => {
      var mergedCache = caches.reduce((acc, cache) => acc.takeItemsFrom(cache));
      return itemsToQuestionsAsString(mergedCache.getItems(), log);
    })
    .then(questionsAsStr => {
      fs.writeFileSync(path.join(WORKSPACE_PATH, 'questions.txt'), questionsAsStr);

      if (argv.editorNo) {
        console.log(`\nDone generating drill in ${WORKSPACE_PATH}\n`);
      } else if (argv.editorYes) {
        launchEditor(WORKSPACE_PATH, () => {
          console.log('TODO: show user which command can be used to check results');
        });
      } else {
        require('@justinc/yesno')({ message: 'Do you want to open your editor in the workspace now?' }).then(answer => {
          if (answer.yes) {
            launchEditor(WORKSPACE_PATH, () => {
              console.log('TODO: show user which command can be used to check results');
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

  // ----------------------------------------------------

    // .catch(err => console.log(err.message));
    // if (err) throw err;

        // pickItemsResult => {
        // // console.log('pickItemsResult:', pickItemsResult);
        // pickItemsResult.forEach(result => {
        //   console.log(Object.keys(result.fileData));
        //   console.log('question:', result.getFileData().question);
        // });
  // });
};
