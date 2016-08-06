var crypto = require('crypto');
var moment = require('moment');

function generateId(data, opts) {
  opts = opts || {};
  opts.prefix = opts.prefix || '';
  opts.hashAlgorithm = opts.hashAlgorithm || 'md5';
  opts.digestEncoding = opts.digestEncoding || 'hex';

  return opts.prefix + crypto.createHash(opts.hashAlgorithm).update(data).digest(opts.digestEncoding);
}

const NOOP = () => {};
const NOOP_LOGGER = {
  log: NOOP,
  fatal: NOOP,
  error: NOOP,
  warn: NOOP,
  info: NOOP,
  debug: NOOP,
  trace: NOOP
};

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

// var winston = require('winston');
// var path = require('path');
// const DRILL_DIR_PATH = require('@justinc/drill-conf').drillDirPath;
// const LAST_RUN_LOG_FILE_NAME = require('@justinc/drill-conf').lastGenRunLogFileName;
// winston.add(winston.transports.File, { filename: path.join(DRILL_DIR_PATH, LAST_RUN_LOG_FILE_NAME) });
// winston.remove(winston.transports.Console);

/**
 * @param  {[type]} db       The db to use in calculating strength
 * @param  {[type]} filename Name of file in which given item is found
 * @param  {[type]} item     The item (found in filename) whose strength to calculate
 * @param  {[type]} opts     Options
 * @param  {[type]} cb       Callback
 * @return {[type]}          A score for the strength of the item (NaN means the item's state in the db is invalid)
 */
module.exports = (db, filename, item, opts, cb) => {
  opts = opts || {};
  opts.logger = opts.logger || NOOP_LOGGER;
  opts.points = {
    numberOfTimesAsked: 0.5,
    lastAnswerWasCorrect: [2, -2],
    lastAskedTime: [ [1, 0], [2, -1], [5, -2], [10, -4], [20, -6], [30, -8], [60, -15] ]
  };
  var logger = opts.logger;

  const ID = item.id || generateId(item.question, {
    prefix: filename + '-'
  });

  db.get(ID, (err, value) => {
    if (err) {
      logger.debug({ found: false }, `Item with id '${ID}' was not found in db`);
      cb(null, 0);
    }
    logger.debug({ found: true }, `Item with id '${ID}': ${value}`);

    if (!value.drillMeta) {
      logger.error({ drillMeta: false }, `Item with id '${ID}' has no 'drillMeta' - cannot calculate strength`);
      cb(null, NaN);
    }

    const NUMBER_OF_TIMES_ASKED = value.drillMeta.numberOfTimesAsked;
    const LAST_ANSWER_WAS_CORRECT = value.drillMeta.lastAnswerWasCorrect;
    const LAST_ASKED_TIME = value.drillMeta.lastAskedTime;

    if (!NUMBER_OF_TIMES_ASKED) {
      logger.error({ drillMeta: false }, `Item with id '${ID}' has no 'drillMeta.numberOfTimesAsked' - cannot calculate strength`);
      cb(null, NaN);
    }
    if (!LAST_ANSWER_WAS_CORRECT) {
      logger.error({ drillMeta: false }, `Item with id '${ID}' has no 'drillMeta.lastAnswerWasCorrect' - cannot calculate strength`);
      cb(null, NaN);
    }
    if (!LAST_ASKED_TIME) {
      logger.error({ drillMeta: false }, `Item with id '${ID}' has no 'drillMeta.lastAskedTime' - cannot calculate strength`);
      cb(null, NaN);
    }

    var s1 = calculateStrengthByNumberOfTimesAsked(NUMBER_OF_TIMES_ASKED, opts.points['numberOfTimesAsked']);
    logger.debug({ points: true }, `Item with id '${ID}', based on number of times asked, got strength of: ${s1}`);
    var s2 = calculateStrengthByLastAnswerWasCorrect(LAST_ANSWER_WAS_CORRECT, opts.points['lastAnswerWasCorrect']);
    logger.debug({ points: true }, `Item with id '${ID}', based on last answer was correct, got strength of: ${s2}`);
    var s3 = calculateStrengthByLastAskedTime(LAST_ASKED_TIME, opts.points['lastAskedTime']);
    logger.debug({ points: true }, `Item with id '${ID}', based on last asked time, got strength of: ${s3}`);

    var strength = s1 + s2 + s3;
    logger.info({ points: true }, `Item with id '${ID}' got total strength of: ${strength}`);

    cb(null, strength);
  });

};
