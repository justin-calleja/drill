const fs = require('fs');
const path = require('path');
const through = require('through2');
const JSONStream = require('JSONStream');
const db = require('../../../dbConnection');

module.exports = (argv) => {
  var dumpFilePath = argv.file;
  var force = argv.force;
  if (!dumpFilePath) {
    console.log('Cannot restore without a dump file to restore from');
    process.exit(-1);
  }
  var dumpFileAbsPath = path.resolve(process.cwd(), dumpFilePath);
  var readStream = fs.createReadStream(dumpFileAbsPath);

  const dumpFileStream = readStream.pipe(JSONStream.parse()).pipe(through.obj(function(parsedObj, _, cb) {
    var key = parsedObj.key;
    var value = parsedObj.value;
    db.get(key, err => {
      if (!err) {
        // !err => item found in db since get errors out if key not found in db.
        if (!force) {
          console.log(`An item with id '${key}' already exists in db. Not overwriting. Use --force to overwrite`);
          return cb();
        } else {
          console.log(`An item with id '${key}' already exists in db. Overwriting it.`);
        }
      }

      db.put(key, value, err => {
        if (err) {
          console.log(`An error occurred while trying to restore item with id '${key}'`);
        }
        console.log(`Done restoring item with id '${key}'`);
        return cb();
      });
    });
  }));

  dumpFileStream.on('end', () => console.log(`\nDone restoring from: ${dumpFileAbsPath}`));
  dumpFileStream.on('error', () => console.log(`\nError while restoring from: ${dumpFileAbsPath}`));
};
