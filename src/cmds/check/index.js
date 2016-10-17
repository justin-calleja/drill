const noOpLogger = require('@justinc/no-op-logger');
const path = require('path');
const getOrDie = require('@justinc/drill-conf').getOrDie;
const QUIZ_FILE_NAME = require('@justinc/drill-conf').defaultQuizFileName;
const fs = require('fs');
const db = require('../../dbConnection');
const Item = require('../gen/Item');
var inquirer = require('inquirer');
var { partition } = require('ramda');
var chalk = require('chalk');

const WORKSPACE_PATH = getOrDie('workspace.path');
const QUIZ_ABS_PATH = path.join(WORKSPACE_PATH, QUIZ_FILE_NAME);

function split(arr, { delimiter = '- - -', drop = [''] } = {}) {
  var result = [];
  var buffer = [];
  arr.forEach(item => {
    if (item.startsWith(delimiter)) {
      result.push(buffer);
      buffer = [];
    } else if (!drop.includes(item)){
      buffer.push(item);
    }
  });
  return result;
}

function parseSection(section) {
  var parsedData = {
    id: null,
    userAnswer: null
  };
  var answerBuffer = [];
  var isAfterQuestionType = false;
  section.forEach(line => {
    if (line.startsWith('# ')) {
      parsedData.id = line.substring(2);
    } else if (line.startsWith('### ')) {
      isAfterQuestionType = true;
    } else if (isAfterQuestionType) {
      answerBuffer.push(line);
    }
  });
  parsedData.userAnswer = answerBuffer.join('\n');
  return parsedData;
}

// TODO: DRY this as used by db-cmds/get
function fetchById(id) {
  return new Promise((resolve, reject) => {
    db.get(id, (err, value) => {
      if (err) {
        reject(`Cannot check item with id ${id}. Could not find it in db. Try loading the item in db.`);
      }
      resolve(value);
    });
  });
}

// TODO: make this general.
// Currently, assumes item is of type: confirm.
// Uses item.getAnswer().text
function createPromptFromPendingItem(pItem) {
  var userAnswer = pItem.getLatestUserAnswer();
  var answerInfo = pItem.getAnswer();
  var correctAnswer = answerInfo.text;
  pItem.setIsPendingUserConfirm(false);
  var message = '- - -\n'
   + `[${answerInfo.delegate}]\n`
   + `[question]: ${chalk.green(pItem.getQuestion())}\n`
   + `[you answered]: ${chalk.blue(userAnswer)}\n`
   + `[correct answer]: ${correctAnswer}\n`
   + 'Accept?';

  return {
    type: 'list',
    name: pItem.getId(),
    message,
    choices: ['yes', 'no', 'skip'],
    filter: (userSelection) => {
      pItem.setUserConfirm(userSelection);
      return pItem;
    }
  };
}

function createItemsFromUserAnswersAndDbEntries(userAnswersAndDbEntries) {
  return userAnswersAndDbEntries.map(({ userAnswer, dbEntryAsString }) => {
    return (new Item()).fromJSON(dbEntryAsString).checkAnswer(userAnswer);
  });
}

/**
 *
 * @param  {Array<Item>} pItems pending Items
 * @return {Promise<Array<Item>>}
 */
function handlePendingItems(pItems) {
  var prompt = inquirer.createPromptModule();
  let questions = pItems.map(createPromptFromPendingItem);
  return prompt(questions).then(answers => {
    var items = Object.keys(answers).map(key => answers[key]);
    var nonSkippedItems = items.filter(item => !(item.getUserConfirm() === 'skip'));
    nonSkippedItems.forEach(item => {
      item.addLatestUserAnswer(item.getLatestUserAnswer());
      item.setLastAnswerWasCorrect(item.getUserConfirm() === 'yes');
      item.setNumberOfTimesAsked(item.getNumberOfTimesAsked() + 1);
      item.setLastAskedTime(new Date());
    });
    return nonSkippedItems;
  });
}

module.exports = (argv, opts) => {
  var log = opts.log || noOpLogger;

  var logAndExit = (errReason) => {
    [ log.error.bind(log), console.log ].forEach(logger => logger(errReason));
    process.exit(1);
  };

  var quizAsStr = fs.readFileSync(QUIZ_ABS_PATH).toString();
  var quizLines = quizAsStr.split('\n');

  var sections = split(quizLines);
  var parsedSections = sections.map(parseSection);

  var userAnswerAndDbEntryPromises = parsedSections.map(({ id, userAnswer }) => {
    return fetchById(id).then(dbEntryAsString => ({ userAnswer, dbEntryAsString}));
  });

  Promise.all(userAnswerAndDbEntryPromises)
    .then(createItemsFromUserAnswersAndDbEntries, logAndExit)
    .then(items => {
      var [pendingItems, nonPendingItems] = partition(item => item.isPendingUserConfirm(), items);
      return pendingItems.length === 0
        ? items
        : handlePendingItems(pendingItems).then(handledItems => nonPendingItems.concat(handledItems));
    }, logAndExit)
    .then(items => {
      var saveItemPromises = items.map(item => {
        return new Promise((resolve, reject) => {
          db.put(item.getId(), item.toJSON(), err => {
            if (err) return reject(err);
            resolve(item);
          });
        });
      });
      return Promise.all(saveItemPromises);
    }, logAndExit)
    .then(items => {
      items.forEach(item => {
        [ log.info.bind(log), console.log ].forEach(logger => {
          logger(`[Updated: ${item.getId()}]: ${item.getQuestion()}`);
        });
        console.log(item.toReportString({ chalk }));
      });
      console.log('\nCheck complete');
    });

};
