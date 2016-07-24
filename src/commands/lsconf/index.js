var nconf = require('nconf');
var columnify = require('columnify');
var confKeys = require('@justinc/drill-conf').confKeys;

module.exports = function _lsconf(_argv) {
  console.log(columnify(confKeys.reduce((acc, val) => {
    acc[val] = nconf.get(val);
    return acc;
  }, {})));
};
