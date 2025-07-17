// lib/mysql.js
import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  idleTimeout: 60000,
  ssl: false, // Set to true if your MySQL server requires SSL
});

// Test connection on startup
pool
  .getConnection()
  .then((connection) => {
    console.log("✅ MySQL database connected successfully");
    connection.release();
  })
  .catch((err) => {
    console.error("❌ MySQL connection error:", err.message);
  });

export default pool;
