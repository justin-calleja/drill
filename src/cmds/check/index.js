const noOpLogger = require('@justinc/no-op-logger');
const path = require('path');
const getOrDie = require('@justinc/drill-conf').getOrDie;
const QUIZ_FILE_NAME = require('@justinc/drill-conf').defaultQuizFileName;
const fs = require('fs');
const db = require('../../dbConnection');
const Item = require('../gen/Item');

const WORKSPACE_PATH = getOrDie('workspace.path');
const QUIZ_ABS_PATH = path.join(WORKSPACE_PATH, QUIZ_FILE_NAME);

function runSerial(tasks) {
  var result = Promise.resolve();
  tasks.forEach(task => {
    result = result.then(() => task());
  });
  return result;
}

module.exports = (argv, opts) => {
  var log = opts.log || noOpLogger;

  var quizAsStr = fs.readFileSync(QUIZ_ABS_PATH).toString();
  var quizLines = quizAsStr.split('\n');

  var chunks = [];
  var buffer = [];
  quizLines.forEach(line => {
    if (line.startsWith('- - -')) {
      chunks.push(buffer);
      buffer = [];
    } else if (line !== ''){
      buffer.push(line);
    }
  });

  var responseWrappers = chunks.map(chunk => {
    var responseWrapper = {
      id: null,
      // you don't need the questionType. Only showing it in quiz.md so the user knows how to answer.
      questionType: null,
      userAnswer: null
    };
    var answerBuffer = [];
    var isAfterQuestionType = false;
    chunk.forEach(line => {
      if (line.startsWith('# ')) {
        responseWrapper.id = line.substring(2);
      } else if (line.startsWith('### ')) {
        responseWrapper.questionType = line.substring(4);
        isAfterQuestionType = true;
      } else if (isAfterQuestionType) {
        answerBuffer.push(line);
      }
    });
    responseWrapper.userAnswer = answerBuffer.join('\n');
    return responseWrapper;
  });

  var promises = responseWrappers.map(responseWrapper => {
    return new Promise((resolve, reject) => {
      db.get(responseWrapper.id, (err, value) => {
        if (err) {
          reject(`Cannot check item with id ${responseWrapper.id}. Could not find it in db. Try loading the item in db.`);
        }
        // resolve([responseWrapper.userAnswer, value]);
        resolve({
          userAnswer: responseWrapper.userAnswer,
          dbEntryAsString: value
        });
      });
    });
  });

  Promise.all(promises).then(result => {
    var itemPromises = result.map(({ userAnswer, dbEntryAsString }) => {
      var item = new Item();
      item.fromJSON(dbEntryAsString);
      return item.checkAnswer(userAnswer);
    });
    // return Promise.all(itemPromises);
    return runSerial(itemPromises);
  }, errReason => {
    [ log.error.bind(log), console.log ].forEach(logger => logger(errReason));
    process.exit(1);
  }).then(items => {
    console.log('in here, items is:', items);
    // save modified items in db

    // var saveItemPromises = items.map(item => {
    //   return new Promise((resolve, reject) => {
    //     // item.put
    //     db.put(item.getId(), item.toJSON(), err => {
    //       if (err) return reject(err);
    //       [ log.info.bind(log), console.log ].forEach(logger => logger(`Updated item with id: ${item.getId()}`));
    //       resolve();
    //     });
    //   });
    // });
    // return saveItemPromises;
  }).then(() => {
    console.log('\nCheck complete');
  });

};
