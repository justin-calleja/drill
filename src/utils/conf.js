var path = require('path');
var os = require('os');

const _confFileName = 'conf.json';
const _drillDirPath = path.join(os.homedir(), '.drill');
const _confFilePath = path.join(_drillDirPath, 'conf.json');

const kvs = [
  ['workspace.path', path.join(_drillDirPath, 'drill-workspace')],
  ['db.path', path.join(_drillDirPath, 'db')],
  ['container.paths', [path.join(os.homedir(), 'default-drill-material-container')]]
];

const _confObj = kvs.reduce((acc, val) => {
  acc[val[0]] = val[1];
  return acc;
}, {});

module.exports = {
  confFileName: _confFileName,
  confFilePath: _confFilePath,
  drillDirPath: _drillDirPath,
  confObj: _confObj,
  confStr: JSON.stringify(_confObj, null, 2)
};
