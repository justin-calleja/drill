var getOrDie = require('@justinc/drill-conf').getOrDie;
var confKeys = require('@justinc/drill-conf').confKeys;
var columnify = require('columnify');

module.exports = function _lsconf(_argv) {
  console.log(columnify(confKeys.reduce((acc, val) => {
    acc[val] = getOrDie(val);
    return acc;
  }, {})));
};
