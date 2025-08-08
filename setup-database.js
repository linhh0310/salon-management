const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
  let connection;
  
  try {
    // Kết nối không có database
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '11223344',
      multipleStatements: true
    });

    console.log('🔧 Đang reset database salon_management...');
    
    // Đọc file reset-database.sql
    const sqlFile = fs.readFileSync(path.join(__dirname, 'reset-database.sql'), 'utf8');
    console.log('📄 Đã đọc file SQL, kích thước:', sqlFile.length, 'ký tự');
    
    // Thực thi toàn bộ SQL
    try {
      const result = await connection.query(sqlFile);
      console.log('✅ Database reset hoàn thành!');
      console.log('📊 Kết quả:', result);
      console.log('📊 Các bảng đã được tạo:');
      console.log('   - users');
      console.log('   - categories');
      console.log('   - services');
      console.log('   - stylists');
      console.log('   - products');
      console.log('   - appointments');
      console.log('   - reviews');
      console.log('   - orders');
      console.log('   - order_items');
      console.log('   - contact_messages');
    } catch (error) {
      console.error('❌ Lỗi reset database:', error.message);
      console.error('❌ Chi tiết lỗi:', error);
    }
    
  } catch (error) {
    console.error('❌ Lỗi kết nối:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

setupDatabase(); 