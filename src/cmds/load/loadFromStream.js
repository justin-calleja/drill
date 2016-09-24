const noOpLogger = require('@justinc/no-op-logger');
const through = require('through2');
const JSONStream = require('JSONStream');
const Item = require('../gen/Item');
const path = require('path');

function loadInDb(db, id, value) {
  return new Promise((resolve, reject) => {
    db.put(id, value, err => {
      if (err) return reject(err);
      resolve();
    });
  });
}

module.exports = ({ stream, db, log = noOpLogger }) => {

  const itemStream = stream.pipe(JSONStream.parse()).pipe(through.obj(function(parsedObj, _, cb) {
    var item = new Item(parsedObj, path.parse(stream.path));
    const ID = item.getId();

    db.get(ID, (err) => {
      if (err) {
        return loadInDb(db, ID, item.toJSON()).then(() => {
          [ log.info.bind(log), console.log ].forEach(logger => logger(`Loaded item with id '${ID}' in db`));
          return cb();
        }).catch((err) => {
          [ log.error.bind(log), console.error ].forEach(logger => logger(`Failed to load item with id ${ID}. Message: ${err.message}`));
          return cb();
        });
      }

      [ log.info.bind(log), console.log ].forEach(logger => logger(`Skipped loading of item with id '${ID}' in db. An item with that id already exists.`));
      return cb();
    });
  }));

  itemStream.on('end', () => [ log.info.bind(log), console.log ].forEach(logger => logger(`\nDone loading: ${stream.path}`)));
  itemStream.on('error', () => [ log.error.bind(log), console.error ].forEach(logger => logger(`\nError occurred while loading: ${stream.path}`)));
};
