// backend/config/db.js
const mysql = require('mysql');

const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'loginDB',
});

db.connect((err) => {
  if (err) {
    console.error('⚠️ MySQL connection failed:', err.message);
    // ❌ DO NOT throw error
  } else {
    console.log('✅ MySQL connected');
  }
});

module.exports = db;
