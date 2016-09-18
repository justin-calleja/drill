const Promise = require('bluebird');

module.exports = (items, log) => {

  return new Promise((resolve, _reject) => {
    log.debug(`Generating questions with item ids: ${items.map(item => item.getId()).join(', ')}`);

    var mappedItems = items.map(item => item.toQuestionStr());

    // using Promises because async ops could happen here in the future if delegate
    // implementations are e.g. read from file.
    return resolve(mappedItems.join('\n'));
  });

};
