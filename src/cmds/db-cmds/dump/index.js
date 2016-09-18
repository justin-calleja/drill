const db = require('../../../dbConnection');
const path = require('path');
const fs = require('fs');

module.exports = (argv) => {
  var dumpFile = argv.file || path.join(process.cwd(), 'dump.json');
  var writeStream = fs.createWriteStream(dumpFile);

  db.createReadStream()
    .on('data', function(data) {
      var obj = {};
      obj.key = data.key;
      obj.value = data.value;
      writeStream.write(JSON.stringify(obj) + '\n');
    })
    .on('error', function(err) {
      writeStream.end();
      console.log(err.message);
      process.exit(1);
    })
    .on('close', function() {
      writeStream.end();
    })
    .on('end', function() {
      writeStream.end();
      console.log(`Done dumping db to ${dumpFile}`);
    });

};
