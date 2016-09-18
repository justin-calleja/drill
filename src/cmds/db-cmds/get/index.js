const db = require('../../../dbConnection');

module.exports = (argv) => {
  const key = argv.key;

  db.get(key, (err, value) => {
    if (err) {
      console.log(err.message);
      process.exit(1);
    }
    console.log(JSON.stringify(JSON.parse(value), null, 2));
  });

};
