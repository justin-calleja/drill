var moment = require('moment');
var Promise = require('bluebird');
var noOpLogger = require('@justinc/no-op-logger');
var drillMeta = require('@justinc/drill-conf').drillMeta;
var R = require('ramda');

function calculateStrengthByNumberOfTimesAsked(value, points) {
  return value * points;
}

function calculateStrengthByLastAnswerWasCorrect(value, points) {
  return value ? points[0] : points[1];
}

function calculateStrengthByLastAskedTime(value, daysAndPoints) {
  var dayAndPt = daysAndPoints.find(dAndP => {
    return moment(value).isAfter(moment().subtract(dAndP[0], 'days'));
  });

  return dayAndPt ? dayAndPt[1] : daysAndPoints[daysAndPoints.length - 1][1] - 2;
}

const DEFAULTS = {
  logger: noOpLogger,
  points: {
    numberOfTimesAsked: 0.5,
    lastAnswerWasCorrect: [2, -2],
    lastAskedTime: [ [1, 0], [2, -1], [5, -2], [10, -4], [20, -6], [30, -8], [60, -15] ]
  }
};

function _logStrength(logger, id, msg, points) {
  logger.trace({ points: true }, `Item with id '${id}', ${msg}, got strength of: ${points}`);
}

/**
 * @param  {[type]} opts     Options
 * @param  {[type]} db       The db to use in calculating strength
 * @param  {Item} item       The item (found in filename) whose strength to calculate
 * @return {[type]}          A score for the strength of the item (NaN means the item's state in the db is invalid)
 */
module.exports = (opts, db, item) => {
  opts = Object.assign({}, DEFAULTS, opts);
  var logger = opts.logger;

  const ID = item.getId();
  var logStrength = R.curry(_logStrength)(logger, ID);

  return new Promise((resolve) => {
    db.get(ID, (err, value) => {
      if (err) {
        logger.info(`Item with id '${ID}' was not found in db`);
        return resolve(0);
      }
      logger.debug(`Item with id '${ID}': ${value}`);

      if (!value[drillMeta]) {
        logger.error({ [drillMeta]: false }, `Item with id '${ID}' has no '${drillMeta}' - cannot calculate strength`);
        return resolve(NaN);
      }

      const { numberOfTimesAsked, lastAnswerWasCorrect, lastAskedTime } = value[drillMeta];

      if (!numberOfTimesAsked) {
        logger.error({ [drillMeta]: false }, `Item with id '${ID}' has no '${drillMeta}.numberOfTimesAsked' - cannot calculate strength`);
        return resolve(NaN);
      }
      if (!lastAnswerWasCorrect) {
        logger.error({ [drillMeta]: false }, `Item with id '${ID}' has no '${drillMeta}.lastAnswerWasCorrect' - cannot calculate strength`);
        return resolve(NaN);
      }
      if (!lastAskedTime) {
        logger.error({ [drillMeta]: false }, `Item with id '${ID}' has no '${drillMeta}.lastAskedTime' - cannot calculate strength`);
        return resolve(NaN);
      }

      return R.compose(
        resolve,
        R.tap(strength => logger.debug({ points: true }, `Item with id '${ID}' got total strength of: ${strength}`)),
        R.sum
      )([
        R.tap(logStrength('based on number of times asked'),
          calculateStrengthByNumberOfTimesAsked(numberOfTimesAsked, opts.points['numberOfTimesAsked'])),
        R.tap(logStrength('based on last answer was correct'),
          calculateStrengthByLastAnswerWasCorrect(lastAnswerWasCorrect, opts.points['lastAnswerWasCorrect'])),
        R.tap(logStrength('based on last asked time'),
          calculateStrengthByLastAskedTime(lastAskedTime, opts.points['lastAskedTime']))
      ]);

    });
  });

};
