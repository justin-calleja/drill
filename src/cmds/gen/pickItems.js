const path = require('path');
var levelup = require('level');
var getOrDie = require('@justinc/drill-conf').getOrDie;
var noOpLogger = require('@justinc/no-op-logger');
var JSONStream = require('JSONStream');
var Promise = require('bluebird');
var curriedFindStrength = require('ramda').curry(require('./findStrength'));
var through = require('through2');
var Item = require('./Item');
var ItemCache = require('./ItemCache');

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
  logger: noOpLogger
};

module.exports = (opts) => {
  opts = Object.assign({}, DEFAULTS, opts);
  const findStrength = curriedFindStrength({ logger: opts.logger }, db);

  return new Promise((resolve, reject) => {
    var cache = new ItemCache();

    if (!opts.streams || (opts.streams.length && opts.streams.length === 0) ) {
      reject(new Error('Cannot generate drill with no streams to read from'));
    }

    var itemStreams = opts.streams.map(stream => {
      return stream.pipe(JSONStream.parse()).pipe(through.obj(function(parsedObj, _, cb) {
        this.push(new Item(parsedObj, path.parse(stream.path)));
        cb();
      }));
    });

    var addToCachePromises = itemStreams.map(itemStream => {
      return new Promise((itemStreamResolve, itemStreamReject) => {
        itemStream.on('data', (item) => findStrength(item).then(s => cache.add(item.strength(s))));
        itemStream.on('end', itemStreamResolve);
        itemStream.on('close', itemStreamResolve);
        itemStream.on('error', itemStreamReject);
      });
    });

    Promise.all(addToCachePromises).then(() => {
      resolve(cache.getItems());
    });

      // .map(stream => [path.parse(stream.path), stream.pipe(JSONStream.parse())])
      // .map(([parsedPath, jsonStream]) => {
      //   return jsonStream.pipe(through.obj(function(obj, _, cb) {
      //     this.push(new Item(obj, parsedPath))
      //     // this.push({
      //     //   parsedPath,
      //     //   item: obj
      //     // });
      //     cb();
      //   }));
      // })
      // .forEach(stream => {
      //   stream.on('data', function(data) {
      //     var item = new Item(data.item, data.parsedPath);
      //     findStrength(db, item, { logger: opts.logger })
      //       .then(strengthPoints => {
      //         item.strength(strengthPoints);
      //       });
      //   });
      // });
  });
};
