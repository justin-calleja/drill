const path = require('path');
const levelup = require('level');
const getOrDie = require('@justinc/drill-conf').getOrDie;
const noOpLogger = require('@justinc/no-op-logger');
const JSONStream = require('JSONStream');
const Promise = require('bluebird');
const curriedFindStrength = require('ramda').curry(require('./findStrength'));
const through = require('through2');
const Item = require('./Item');
const ItemCache = require('./ItemCache');

const DB_PATH = getOrDie('db.path');
var db = levelup(DB_PATH);
process.on('exit', (_code) => {
  db.close();
});
process.on('SIGINT', () => {
  db.close();
});
process.on('uncaughtException', (err) => {
  console.log(err);
  db.close();
  process.exit(1);
});

const DEFAULTS = {
  log: noOpLogger
};

module.exports = (opts) => {
  opts = Object.assign({}, DEFAULTS, opts);
  const findStrength = curriedFindStrength({ log: opts.log }, db);

  // return new Promise((resolve, reject) => {
  var cache = new ItemCache({ log: opts.log });

  if (!opts.streams || (opts.streams.length && opts.streams.length === 0) ) {
    // reject(new Error('Cannot generate drill with no streams to read from'));
    throw new Error('Cannot generate drill with no streams to read from');
  }

  var itemStreams = opts.streams.map(stream => {
    return stream.pipe(JSONStream.parse()).pipe(through.obj(function(parsedObj, _, cb) {
      this.push(new Item(parsedObj, path.parse(stream.path)));
      cb();
    }));
  });

  var addToCachePromises = itemStreams.map(itemStream => {
    return new Promise((itemStreamResolve, itemStreamReject) => {
      itemStream.on('data', (item) => findStrength(item).then(s => {
        cache.examineResultHandler(cache.examine(item.strength(s)));
      }));
      itemStream.on('end', () => {
        itemStreamResolve();
      });
      itemStream.on('close', () => {
        itemStreamResolve();
      });
      itemStream.on('error', () => {
        itemStreamReject();
      });
    });
  });

  // Promise.all(addToCachePromises).then(() => Promise.resolve(cache.getItems()));
  return Promise.all(addToCachePromises).then(() => Promise.resolve(cache.getItems()));
  // });
};
