const Promise = require('bluebird');

function handle(item) {
  const answer = item.getAnswer();
  const delegate = answer.delegate;
  if (delegate === 'one-of') {
    return (
`- - -

# ${item.getId()}

${item.getQuestion()}

### Select (by marking with an 'x') one of:

${answer.choice.map(c => '- ' + c + ': ').join('\n')}
`);
  } else if (delegate === 'mark-correct') {
    return (
`- - -

# ${item.getId()}

${item.getQuestion()}

### Select (by marking with an 'x') all the correct answers:

${answer.choice.map(c => '- ' + c + ': ').join('\n')}
`);
  } else if (delegate === 'confirm') {
    return (
`- - -

# ${item.getId()}

${item.getQuestion()}

### Answer:

`);
  }

  return item.getQuestion();
}

module.exports = (items, log) => {

  return new Promise((resolve, _reject) => {
    log.debug(`Generating questions with item ids: ${items.map(item => item.getId()).join(', ')}`);

    var mappedItems = items.map(item => {
      return handle(item);
    });

    // using Promises because async ops could happen here in the future if delegate
    // implementations are e.g. read from file.
    return resolve(mappedItems.join('\n'));
  });

};
