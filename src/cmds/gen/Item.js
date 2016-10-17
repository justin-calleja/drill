var noOpLogger = require('@justinc/no-op-logger');
const path = require('path');
var generateId = require('./generateId');
const qTemplates = require('./utils/qTemplates');
const aCheckers = require('./utils/aCheckers');
var {
  calculateStrength,
  numberOfTimesAskedToStrength,
  lastAnswerWasCorrectToStrength,
  lastAskedTimeToStrength
} = require('./strength');

// TODO: better to make persistence accessible only through Item.
// That way you can change db implementation and users of Item wouldn't need
// to know.

class Item {

  constructor(fileData, parsedPath) {
    this.fileData = fileData;
    this.nonFileData = {};

    if (parsedPath) {
      var prefix = path.basename(path.dirname(parsedPath.dir)) + '-';
      this.nonFileData.id = prefix + (this.fileData.id || generateId(this.fileData.question));
    }
  }

  toReportString(opts = {}) {
    var chalk = opts.chalk || { blue: () => {}, red: () => {}, green: () => {} };
    var lastAnswerWasCorrectAsString = this.lastAnswerWasCorrectAsString();
    lastAnswerWasCorrectAsString = lastAnswerWasCorrectAsString === 'yes'
      ? chalk.green(lastAnswerWasCorrectAsString)
      : chalk.red(lastAnswerWasCorrectAsString);

    return `* * *\n[id]: ${this.getId()}\n`
    + `[truncated question]: ${this.getQuestion().split(' ').slice(0, 10).join(' ') + '…'}\n`
    + `[last answer was correct]: ${lastAnswerWasCorrectAsString}\n`
    + `[lastest answer]: ${this.getLatestUserAnswer()}\n`
    + `[number of times asked]: ${this.getNumberOfTimesAsked()}\n`
    + `[strength by 'number of times asked']: ${numberOfTimesAskedToStrength(this.getNumberOfTimesAsked())}\n`
    + `[strength by 'last answer was correct']: ${lastAnswerWasCorrectToStrength(this.getLastAnswerWasCorrect())}\n`
    + `[strength by 'last asked time']: ${lastAskedTimeToStrength(this.getLastAskedTime())}\n`
    + `[strength total]: ${chalk.blue(this.getStrength())}\n`
    ;
  }

  toJSON() {
    var newStrength = this.calculateStrength();
    this.setStrength(newStrength);
    return JSON.stringify({
      fileData: this.fileData,
      nonFileData: this.nonFileData
    }, null, 2);
  }

  fromJSON(itemAsJSON, opts = {}) {
    const log = opts.log || noOpLogger;
    var data = JSON.parse(itemAsJSON);
    this.fileData = data.fileData;
    this.nonFileData = data.nonFileData;
    this.setStrength(this.calculateStrength(log));
    return this;
  }

  isPendingUserConfirm() {
    return this.pendingUserConfirm || false;
  }

  setIsPendingUserConfirm(isPending = false) {
    this.pendingUserConfirm = isPending;
  }

  getUserConfirm() {
    return this.userConfirm;
  }

  setUserConfirm(userConfirm) {
    this.userConfirm = userConfirm;
  }

  getId() {
    return this.nonFileData.id;
  }

  setStrength(strength) {
    this.nonFileData.strength = strength;
  }

  getStrength() {
    var newStrength = this.calculateStrength();
    this.setStrength(newStrength);
    return newStrength;
  }

  calculateStrength(log) {
    return calculateStrength(this, { log });
  }

  getNumberOfTimesAsked() {
    return this.nonFileData.numberOfTimesAsked || 0;
  }

  setNumberOfTimesAsked(num) {
    this.nonFileData.numberOfTimesAsked = num;
  }

  /**
   * Returns 1 if last answer was correct, -1 if it wasn't, and 0 if item was never
   * asked.
   * @return {number}
   */
  getLastAnswerWasCorrect() {
    return this.nonFileData.lastAnswerWasCorrect || 0;
  }

  lastAnswerWasCorrectAsString() {
    var lastAnswerWasCorrect = this.getLastAnswerWasCorrect();
    if (lastAnswerWasCorrect === -1) return 'no';
    if (lastAnswerWasCorrect === 1) return 'yes';
    if (lastAnswerWasCorrect === 0) return 'never asked';
  }

  setLastAnswerWasCorrect(bool) {
    this.nonFileData.lastAnswerWasCorrect = bool ? 1 : -1;
  }

  addLatestUserAnswer(answer) {
    var latestUserAnswers = this.nonFileData.latestUserAnswers || [];
    latestUserAnswers.push({ time: new Date(), answer });

    if (latestUserAnswers.length > 10) {
      latestUserAnswers.shift();
      this.nonFileData.latestUserAnswers = latestUserAnswers;
    } else {
      this.nonFileData.latestUserAnswers = latestUserAnswers;
    }
  }

  getLatestUserAnswer() {
    var latestUserAnswer = this.nonFileData.latestUserAnswers;
    if (latestUserAnswer) {
      return latestUserAnswer[latestUserAnswer.length - 1].answer;
    } else {
      return null;
    }
  }

  getLastAskedTime() {
    return this.nonFileData.lastAnswedTime || new Date();
  }

  setLastAskedTime(time) {
    this.nonFileData.lastAnswedTime = time;
  }

  getQuestion() {
    return this.fileData.question;
  }

  // TODO: major refactor. Should be "answerInfo" not "answer". Changes need to be made in data files too.
  getAnswer() {
    return this.fileData.answer;
  }

  getFileData() {
    return this.fileData;
  }

  toQuestionStr() {
    const answer = this.getAnswer();
    const delegate = answer.delegate;
    if (delegate === 'one-of') {
      return qTemplates.oneOf({
        id: this.getId(),
        question: this.getQuestion(),
        type: delegate,
        choices: answer.choices
      });
    } else if (delegate === 'mark-correct') {
      return qTemplates.markCorrect({
        id: this.getId(),
        question: this.getQuestion(),
        type: delegate,
        choices: answer.choices
      });
    } else if (delegate === 'confirm') {
      return qTemplates.confirm({
        id: this.getId(),
        question: this.getQuestion(),
        type: delegate
      });
    } else if (delegate === 'unordered-delimited') {
      return qTemplates.unorderedDelimited({
        id: this.getId(),
        question: this.getQuestion(),
        type: delegate
      });
    }
  }

  /**
   * @param  {String} userAnswer
   * @return {Promise<Item>}
   */
  checkAnswer(userAnswer) {
    const answer = this.getAnswer();
    const delegate = answer.delegate;
    if (delegate === 'one-of') {
      return aCheckers.oneOf(userAnswer, this);
    } else if (delegate === 'mark-correct') {
      return aCheckers.markCorrect(userAnswer, this);
    } else if (delegate === 'confirm') {
      return aCheckers.confirm(userAnswer, this);
    } else if (delegate === 'unordered-delimited') {
      return aCheckers.unorderedDelimited(userAnswer, this);
    }

    throw new Error('No valid delegate');
  }

}

module.exports = Item;
