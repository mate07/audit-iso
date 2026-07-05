/* eslint-disable @typescript-eslint/no-require-imports */
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'audit.db');
const db = new sqlite3.Database(dbPath);

console.log('--- ALL AUDITS ---');
db.all('SELECT * FROM audits', [], (err, rows) => {
  if (err) console.error(err);
  else console.log(rows);
  db.close();
});
