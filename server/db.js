const mysql = require('mysql2');

// Create a connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'users_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const db = pool.promise();

// Test connection
db.getConnection()
  .then(connection => {
    console.log("Connected to MySQL database successfully.");
    connection.release(); // Release connection back to pool
  })
  .catch(err => {
    console.error("Database connection failed:", err);
  });

module.exports = db;
