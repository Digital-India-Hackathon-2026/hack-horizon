require('dotenv').config();
const db = require('./db');
db.getDb().then(pool => {
  return pool.query('SELECT COUNT(*) as count FROM seeds').then(res => {
    console.log('SEEDS COUNT:', res[0][0].count);
    return pool.query('SELECT * FROM seeds LIMIT 1').then(res2 => {
      console.log('FIRST SEED:', res2[0][0]);
      process.exit(0);
    });
  });
}).catch(err => {
  console.error(err);
  process.exit(1);
});
