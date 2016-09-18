const levelup = require('level');
const getOrDie = require('@justinc/drill-conf').getOrDie;

const DB_PATH = getOrDie('db.path');
const DB = levelup(DB_PATH);
process.on('exit', (_code) => {
  DB.close();
});
process.on('SIGINT', () => {
  DB.close();
});
process.on('uncaughtException', (err) => {
  console.log(err);
  DB.close();
  process.exit(1);
});

module.exports = DB;
