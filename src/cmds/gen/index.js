const noOpLogger = require('@justinc/no-op-logger');
const launchEditor = require('@justinc/launch-editor');
const path = require('path');
const streamToCache = require('./streamToCache');
const itemsToQuestionsAsString = require('./itemsToQuestionsAsString');
const fs = require('fs');
const Promise = require('bluebird');
const db = require('../../dbConnection');

const QUIZ_FILE_NAME = require('@justinc/drill-conf').defaultQuizFileName;
const getOrDie = require('@justinc/drill-conf').getOrDie;

const WORKSPACE_PATH = getOrDie('workspace.path');

const QUIZ_ABS_PATH = path.join(WORKSPACE_PATH, QUIZ_FILE_NAME);

module.exports = function _gen(argv, opts) {
  var log = opts.log || noOpLogger;

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
      fs.writeFileSync(QUIZ_ABS_PATH, questionsAsStr);

      if (argv.editorNo) {
        console.log(`\nDone generating drill at ${QUIZ_ABS_PATH}\n`);
      } else if (argv.editorYes) {
        launchEditor(QUIZ_ABS_PATH, () => {
          console.log('TODO: show user which command can be used to check results');
        });
      } else {
        require('@justinc/yesno')({ message: 'Do you want to open the generated file in your editor now?' }).then(answer => {
          if (answer.yes) {
            launchEditor(QUIZ_ABS_PATH, () => {
              console.log('TODO: show user which command can be used to check results');
            });
          } else {
            console.log(`\nDone generating drill at ${QUIZ_ABS_PATH}\n`);
          }
        });
      }
    })
    .catch(err => {
      console.log('\n', err.message, '\n');
      process.exit(1);
    });

};
