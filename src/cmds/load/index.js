const noOpLogger = require('@justinc/no-op-logger');
const getReadableStreams = require('../../getReadableStreams');
const loadFromStream = require('./loadFromStream');

module.exports = (argv, opts) => {
  var log = opts.log || noOpLogger;
  var db = opts.db;
  if (!db) {
    console.log('Could not get a db connection');
    process.exit(1);
  }

  getReadableStreams(log).then(readableStreams => {
    readableStreams.map(stream => loadFromStream({ log, stream, db }));
  });
};
