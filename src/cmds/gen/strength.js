var moment = require('moment');
var noOpLogger = require('@justinc/no-op-logger');

const DEFAULT_WEIGHTS = {
  numberOfTimesAsked: 0.5,
  lastAnswerWasCorrect: [2, -2, 0],
  // now up to 1 day ago = 0 strength
  // 1 day ago, up to 2 days ago = -1 strength
  // 2 days ago, up to 5 days ago = -2 strength
  // 5 days ago, up to 10 days ago = -4 strength
  // 10 days ago, up to 20 days ago = -6 strength
  // 20 days ago, up to 30 days ago = -8 strength
  // 30 days ago, up to 60 days ago = -15 strength
  lastAskedTime: [ [1, 0], [2, -1], [5, -2], [10, -4], [20, -6], [30, -8], [60, -15] ]
};

function numberOfTimesAskedToStrength(numberOfTimesAsked, weight) {
  return numberOfTimesAsked * weight;
}

function lastAnswerWasCorrectToStrength(lastAnswerWasCorrect, weights) {
  if (lastAnswerWasCorrect === 1) return weights[0];
  if (lastAnswerWasCorrect === -1) return weights[1];

  return weights[2];
}

function lastAskedTimeToStrength(lastAskedTime, dayAndWeightPairs) {
  var dayAndWeight = dayAndWeightPairs.find((dAndW, _index) => {
    var result = moment(lastAskedTime).isAfter(moment().subtract(dAndW[0], 'days'));
    return result;
  });

  return dayAndWeight ? dayAndWeight[1] : dayAndWeightPairs[dayAndWeightPairs.length - 1][1] - 2;
}

function calculateStrength(item, opts = {}) {
  const log = opts.log || noOpLogger;
  const WEIGHTS = Object.assign({}, DEFAULT_WEIGHTS, opts.weights);

  var scores = {};
  scores.numberOfTimesAsked = numberOfTimesAskedToStrength(item.getNumberOfTimesAsked(), WEIGHTS.numberOfTimesAsked);
  scores.lastAnswerWasCorrect = lastAnswerWasCorrectToStrength(item.getLastAnswerWasCorrect(), WEIGHTS.lastAnswerWasCorrect);
  scores.lastAskedTime = lastAskedTimeToStrength(item.getLastAskedTime(), WEIGHTS.lastAskedTime);

  var total = scores.numberOfTimesAsked + scores.lastAnswerWasCorrect + scores.lastAskedTime;

  log.debug(`Item id '${item.getId()}' strength scores: numberOfTimesAsked=${scores.numberOfTimesAsked}, `
    + `lastAnswerWasCorrect=${scores.lastAnswerWasCorrect}, lastAskedTime=${scores.lastAskedTime}, `
    + `total=${total}`);

  return total;
}

module.exports = {
  calculateStrength,
  numberOfTimesAskedToStrength,
  lastAnswerWasCorrectToStrength,
  lastAskedTimeToStrength,
  DEFAULT_WEIGHTS
};
