const path = require('path');
var generateId = require('./generateId');

function oneOf(item) {
  const answer = item.getAnswer();
  const delegate = answer.delegate;
  return (
`# ${item.getId()}

${item.getQuestion()}

### ${delegate}

${answer.choice.map(c => '- ' + c + ': ').join('\n')}

- - -
`);
}

function markCorrect(item) {
  const answer = item.getAnswer();
  const delegate = answer.delegate;
  return (
`# ${item.getId()}

${item.getQuestion()}

### ${delegate}

${answer.choice.map(c => '- ' + c + ': ').join('\n')}

- - -
`);
}

function confirm(item) {
  const answer = item.getAnswer();
  const delegate = answer.delegate;
  return (
`# ${item.getId()}

${item.getQuestion()}

### ${delegate}

- - -
`);
}


function unorderedDelimited(item) {
  const answer = item.getAnswer();
  const delegate = answer.delegate;
  return (
`# ${item.getId()}

${item.getQuestion()}

### ${delegate}

- - -
`);
}

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

  /**
   * Returns 1 if last answer was correct, -1 if it wasn't, and 0 if item was never
   * asked.
   * @return {number}
   */
  getLastAnswerWasCorrect() {
    return this.nonFileData.lastAnswerWasCorrect || 0;
  }

  getLastAskedTime() {
    return this.nonFileData.lastAnswedTime || new Date();
  }

  getQuestion() {
    return this.fileData.question;
  }

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
      return oneOf(this);
    } else if (delegate === 'mark-correct') {
      return markCorrect(this);
    } else if (delegate === 'confirm') {
      return confirm(this);
    } else if (delegate === 'unordered-delimited') {
      return unorderedDelimited(this);
    }
  }

}

module.exports = Item;
