const noOpLogger = require('@justinc/no-op-logger');
const through = require('through2');
const JSONStream = require('JSONStream');
const Item = require('../gen/Item');
const path = require('path');

module.exports = ({ stream, db, log = noOpLogger }) => {

  const itemStream = stream.pipe(JSONStream.parse()).pipe(through.obj(function(parsedObj, _, cb) {
    var item = new Item(parsedObj, path.parse(stream.path));
    const ID = item.getId();

    db.put(ID, item.toString(), (err) => {
      if (err) {
        [ log.error.bind(log), console.error ].forEach(logger => logger(`Failed to load item with id ${ID}. Message: ${err.message}`));
        return cb();
      }
      [ log.info.bind(log), console.log ].forEach(logger => logger(`Loaded item with id '${ID}' in db`));
      return cb();
    });
  }));

  itemStream.on('end', () => [ log.info.bind(log), console.log ].forEach(logger => logger(`\nDone loading: ${stream.path}`)));
  itemStream.on('error', () => [ log.error.bind(log), console.error ].forEach(logger => logger(`\nError occurred while loading: ${stream.path}`)));
};
