var launchEditor = require('@justinc/launch-editor');
var getReadableStreams = require('./getReadableStreams');
var getOrDie = require('@justinc/drill-conf').getOrDie;
var async = require('async');
var resetWorkspace = require('../workspace-cmds/reset/resetWorkspace');
var del = require('del');
var bunyan = require('bunyan');
var path = require('path');
const DRILL_DIR_PATH = require('@justinc/drill-conf').drillDirPath;
const LAST_GEN_RUN_LOG_FILE_NAME = require('@justinc/drill-conf').lastGenRunLogFileName;

module.exports = function _gen(argv) {
  var logFilePath = path.join(DRILL_DIR_PATH, LAST_GEN_RUN_LOG_FILE_NAME);
  del.sync([logFilePath], { force: true });
  var log = bunyan.createLogger({
    name: 'drill-gen',
    streams: [
      {
        level: argv.logLevel,
        path: logFilePath
      }
    ]
  });
  log.info(`Logging level is: ${argv.logLevel}`);

  var workspacePath = getOrDie('workspace.path');
  var doResetWorkspace = (cb) => {
    resetWorkspace(workspacePath, (err, result) => {
      if (err) cb(err);

      result = result || {};
      if (result.deletedPaths) {
        console.log('\nDeleted the following:');
        result.deletedPaths.forEach(p => {
          console.log(p);
          log.debug(`Resetting workspace deleted: ${p}`);
        });
        console.log();
        return cb(null);
      } else if (result.userSaysNo) {
        [console.log, log.warn].forEach(out => out('\nCannot generate a drill without resetting the workspace'));
        process.exit(0);
      } else {
        cb(null);
      }
    });
  };

  var doGetReadableStreams = (cb) => {
    getReadableStreams(cb, log);
  };

  async.parallel({ doResetWorkspace, doGetReadableStreams }, function(err, results) {
    if (err) throw err;

    console.log('results.doGetReadableStreams:', results.doGetReadableStreams);
    // [
    //   [ '/Users/justin/default-drill-material-container', [ [Object], [Object] ] ]
    // ]

    if (!argv['skip-edit']) {
      launchEditor(workspacePath, () => {
        console.log('TODO: read user submitted answers');
        console.log('TODO: check answers');
        console.log('TODO: write data to keep track of what was asked, when, and how the user did');
      });
    }
  });
};
