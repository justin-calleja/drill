const path = require('path');
var generateId = require('./generateId');
const qTemplates = require('./utils/qTemplates');
const aCheckers = require('./utils/aCheckers');

class Item {

  constructor(fileData, parsedPath) {
    this.fileData = fileData;
    this.nonFileData = {};

    if (parsedPath) {
      var prefix = path.basename(path.dirname(parsedPath.dir)) + '-';
      this.nonFileData.id = prefix + (this.fileData.id || generateId(this.fileData.question));
    }
  }

  toJSON() {
    return JSON.stringify({
      fileData: this.fileData,
      nonFileData: this.nonFileData
    }, null, 2);
  }

  fromJSON(itemAsJSON) {
    var data = JSON.parse(itemAsJSON);
    this.fileData = data.fileData;
    this.nonFileData = data.nonFileData;
  }

  getId() {
    return this.nonFileData.id;
  }

  setStrength(strength) {
    this.nonFileData.strength = strength;
  }

  getStrength() {
    return this.nonFileData.strength || 0;
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
      return aCheckers.confirm(userAnswer, this).then(item => {
        console.log('in confrim then, item:', item);
        return item;
      });
    } else if (delegate === 'unordered-delimited') {
      return aCheckers.unorderedDelimited(userAnswer, this);
    }

    throw new Error('No valid delegate');
  }

}

module.exports = Item;
