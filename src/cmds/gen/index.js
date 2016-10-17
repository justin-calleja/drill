const noOpLogger = require('@justinc/no-op-logger');
const launchEditor = require('@justinc/launch-editor');
const path = require('path');
const itemsToQuestionsAsString = require('./itemsToQuestionsAsString');
const fs = require('fs');
const db = require('../../dbConnection');
const resetWorkspace = require('./resetWorkspace');
const Item = require('./Item');
const ItemCache = require('./ItemCache');
const yesno = require('@justinc/yesno');

const QUIZ_FILE_NAME = require('@justinc/drill-conf').defaultQuizFileName;
const getOrDie = require('@justinc/drill-conf').getOrDie;

const WORKSPACE_PATH = getOrDie('workspace.path');

const QUIZ_ABS_PATH = path.join(WORKSPACE_PATH, QUIZ_FILE_NAME);

function promptUserAfterGen(argv) {
  if (argv.editorNo) {
    console.log(`\nDone generating drill at ${QUIZ_ABS_PATH}\n`);
  } else if (argv.editorYes) {
    launchEditor(QUIZ_ABS_PATH, () => {
      console.log('TODO: show user which command can be used to check results');
    });
  } else {
    yesno({ message: 'Do you want to open the generated file in your editor now?' }).then(answer => {
      if (answer.yes) {
        launchEditor(QUIZ_ABS_PATH, () => {
          console.log('TODO: show user which command can be used to check results');
        });
      } else {
        console.log(`\nDone generating drill at ${QUIZ_ABS_PATH}\n`);
      }
    });
  }
}

module.exports = function _gen(argv, opts) {
  var log = opts.log || noOpLogger;

  resetWorkspace(log).then(() => {
    var cache = new ItemCache({ log: opts.log });

    db.createReadStream()
      .on('data', data => cache.input((new Item()).fromJSON(data.value, { log })))
      .on('error', err => {
        console.log(err.message);
        process.exit(1);
      })
      .on('end', () => {
        log.debug('Done streaming from db');
        itemsToQuestionsAsString(cache.getItems(), log).then(questionsAsString => {
          fs.writeFileSync(QUIZ_ABS_PATH, questionsAsString);
          promptUserAfterGen(argv);
        });
      });
  });

};
