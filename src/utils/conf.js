var path = require('path');
var os = require('os');

const _confFileName = 'conf.json';
const _drillDirPath = path.join(os.homedir(), '.drill');
const _confFilePath = path.join(_drillDirPath, 'conf.json');

const _workspacePath = path.join(_drillDirPath, 'drill-workspace');
const _defaultMaterialPath = path.join(os.homedir(), 'drill-material');
const _confFileContents = `{
  "workspace.path": "${_workspacePath}",
  "materials.paths": [
    "${_defaultMaterialPath}"
  ]
}`;

module.exports = {
  confFileName: _confFileName,
  confFilePath: _confFilePath,
  drillDirPath: _drillDirPath,
  confFileContents: _confFileContents
};
