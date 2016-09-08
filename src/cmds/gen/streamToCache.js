const path = require('path');
const noOpLogger = require('@justinc/no-op-logger');
const JSONStream = require('JSONStream');
const curriedFindStrength = require('ramda').curry(require('./findStrength'));
const through = require('through2');
const Item = require('./Item');
const ItemCache = require('./ItemCache');

const DEFAULTS = {
  log: noOpLogger
};

module.exports = (opts) => {
  opts = Object.assign({}, DEFAULTS, opts);

  return new Promise((resolve, reject) => {
    if (!opts.stream) return resolve(new Error('Missing required stream'));
    if (!opts.db) return resolve(new Error('Missing required db'));

    const stream = opts.stream;
    const db = opts.db;
    const findStrength = curriedFindStrength({ log: opts.log }, db);
    var cache = new ItemCache({ log: opts.log });

    const itemStream = stream.pipe(JSONStream.parse()).pipe(through.obj(function(parsedObj, _, cb) {
      this.push(new Item(parsedObj, path.parse(stream.path)));
      cb();
    }));

    itemStream.on('data', (item) => {
      findStrength(item).then(s => cache.input(item.strength(s)));
    });
    itemStream.on('end', () => {
      resolve(cache);
    });
    itemStream.on('close', () => {
      resolve(cache);
    });
    itemStream.on('error', (err) => {
      reject(err);
    });
  });

};
