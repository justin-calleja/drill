const noOpLogger = require('@justinc/no-op-logger');
const path = require('path');
const getOrDie = require('@justinc/drill-conf').getOrDie;
const QUIZ_FILE_NAME = require('@justinc/drill-conf').defaultQuizFileName;
const fs = require('fs');
const db = require('../../dbConnection');

const WORKSPACE_PATH = getOrDie('workspace.path');
const QUIZ_ABS_PATH = path.join(WORKSPACE_PATH, QUIZ_FILE_NAME);

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

  // TODO: checking has an implicit assumption that all items exist in the db even
  // if these items were never asked before. i.e. as part of generating the quiz.md
  // you need to insert each item in the db even if it has not been processed before
  // i.e. more to do in gen.

  // responseWrappers.forEach(responseWrapper => {
  //   db.get(responseWrapper.id, (err, value) => {
  //     if (err) {
  //      throw error this should not happen as gen should have inserted all items being processed right now
  //     }
  //   });
  // });

};
