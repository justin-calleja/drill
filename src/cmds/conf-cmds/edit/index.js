var launchEditor = require('@justinc/launch-editor');
const CONF_FILE_PATH = require('@justinc/drill-conf').confFilePath;

module.exports = function _econf(_argv) {
  launchEditor(CONF_FILE_PATH);
};
