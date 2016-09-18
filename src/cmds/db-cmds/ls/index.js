const db = require('../../../dbConnection');

module.exports = (_argv) => {
  db.createKeyStream()
    .on('data', function(data) {
      console.log(data);
    });
};
