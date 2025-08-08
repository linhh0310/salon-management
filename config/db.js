const mysql = require('mysql2');
require('dotenv').config();

// Tạo connection pool thay vì single connection
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '11223344',
  database: process.env.DB_NAME || 'salon_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Lỗi kết nối database:', err.message);
    return;
  }
  console.log('✅ Kết nối MySQL thành công!');
  connection.release();
});

module.exports = pool.promise();
