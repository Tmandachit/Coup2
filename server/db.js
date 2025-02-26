const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'localhost', 
  user: 'root',
  password: 'CoupGame',
  database: 'users_db',
  waitForConnections: true,
  queueLimit: 0,
});

const db = pool.promise();
module.exports = db;
