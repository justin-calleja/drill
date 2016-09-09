const Promise = require('bluebird');

function handle(delegate, item) {
  if (delegate === 'one-of') {
    return item.getQuestion();
  } else if (delegate === 'confirm') {
    return item.getQuestion();
  }

  return item.getQuestion();
}

module.exports = (items, log) => {

  return new Promise((resolve, _reject) => {
    log.debug(`Generating questions with item ids: ${items.map(item => item.getId()).join(', ')}`);

    var mappedItems = items.map(item => {
      return handle(item.getDelegate(), item);
    });

    // using Promises because async ops could happen here in the future if delegate
    // implementations are e.g. read from file.
    return resolve(mappedItems.join('\n\n'));
  });

};
