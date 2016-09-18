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

  getId() {
    return this.nonFileData.id;
  }

  strength(strength) {
    this.nonFileData.strength = strength;
    return this;
  }

  getStrength() {
    return this.nonFileData.strength || 0;
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
