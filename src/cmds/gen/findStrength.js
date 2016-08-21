var moment = require('moment');
var Promise = require('bluebird');
var noOpLogger = require('@justinc/no-op-logger');
var drillMeta = require('@justinc/drill-conf').drillMeta;

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

// var winston = require('winston');
// var path = require('path');
// const DRILL_DIR_PATH = require('@justinc/drill-conf').drillDirPath;
// const LAST_RUN_LOG_FILE_NAME = require('@justinc/drill-conf').lastGenRunLogFileName;
// winston.add(winston.transports.File, { filename: path.join(DRILL_DIR_PATH, LAST_RUN_LOG_FILE_NAME) });
// winston.remove(winston.transports.Console);

/**
 * @param  {[type]} opts     Options
 * @param  {[type]} db       The db to use in calculating strength
 * @param  {Item} item       The item (found in filename) whose strength to calculate
 * @return {[type]}          A score for the strength of the item (NaN means the item's state in the db is invalid)
 */
module.exports = (opts, db, item) => {
  opts = Object.assign({}, DEFAULTS, opts);
  var logger = opts.logger;

  return new Promise((resolve) => {
    const ID = item.getId();
    db.get(ID, (err, value) => {
      if (err) {
        logger.info(`Item with id '${ID}' was not found in db`);
        resolve(0);
        return;
      }
      logger.debug(`Item with id '${ID}': ${value}`);

      if (!value[drillMeta]) {
        logger.error({ [drillMeta]: false }, `Item with id '${ID}' has no '${drillMeta}' - cannot calculate strength`);
        resolve(NaN);
        return;
      }

      const NUMBER_OF_TIMES_ASKED = value[drillMeta].numberOfTimesAsked;
      const LAST_ANSWER_WAS_CORRECT = value[drillMeta].lastAnswerWasCorrect;
      const LAST_ASKED_TIME = value[drillMeta].lastAskedTime;

      if (!NUMBER_OF_TIMES_ASKED) {
        logger.error({ [drillMeta]: false }, `Item with id '${ID}' has no '${drillMeta}.numberOfTimesAsked' - cannot calculate strength`);
        resolve(NaN);
        return;
      }
      if (!LAST_ANSWER_WAS_CORRECT) {
        logger.error({ [drillMeta]: false }, `Item with id '${ID}' has no '${drillMeta}.lastAnswerWasCorrect' - cannot calculate strength`);
        resolve(NaN);
        return;
      }
      if (!LAST_ASKED_TIME) {
        logger.error({ [drillMeta]: false }, `Item with id '${ID}' has no '${drillMeta}.lastAskedTime' - cannot calculate strength`);
        resolve(NaN);
        return;
      }

      var s1 = calculateStrengthByNumberOfTimesAsked(NUMBER_OF_TIMES_ASKED, opts.points['numberOfTimesAsked']);
      logger.trace({ points: true }, `Item with id '${ID}', based on number of times asked, got strength of: ${s1}`);
      var s2 = calculateStrengthByLastAnswerWasCorrect(LAST_ANSWER_WAS_CORRECT, opts.points['lastAnswerWasCorrect']);
      logger.trace({ points: true }, `Item with id '${ID}', based on last answer was correct, got strength of: ${s2}`);
      var s3 = calculateStrengthByLastAskedTime(LAST_ASKED_TIME, opts.points['lastAskedTime']);
      logger.trace({ points: true }, `Item with id '${ID}', based on last asked time, got strength of: ${s3}`);

      var strength = s1 + s2 + s3;
      logger.debug({ points: true }, `Item with id '${ID}' got total strength of: ${strength}`);

      resolve(strength);
    });
  });

};
