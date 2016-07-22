var path = require('path');
var os = require('os');
var _ = require('lodash');
var fs = require('fs');

function _confFileName() {
  return 'conf.json';
}

function _drillDirPath() {
  return path.join(os.homedir(), '.drill');
}

function _confFilePath() {
  return path.join(_drillDirPath(), 'conf.json');
}

var defaultConfigFileTmplStr = fs.readFileSync(path.join(__dirname, 'defaultConfigFile.tmpl.json')).toString();
var compiled = _.template(defaultConfigFileTmplStr);
function _confFileContents() {
  return compiled({
    workspacePath: path.join(_drillDirPath(), 'drill-workspace')
  });
}

module.exports = {
  confFileName: _confFileName,
  confFilePath: _confFilePath,
  drillDirPath: _drillDirPath,
  confFileContents: _confFileContents
};
