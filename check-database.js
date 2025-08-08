const mysql = require('mysql2/promise');

async function checkDatabase() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '11223344',
      database: 'salon_management'
    });

    console.log('🔍 Kiểm tra cấu trúc database...');
    
    // Kiểm tra bảng services
    const [servicesColumns] = await connection.execute('DESCRIBE services');
    console.log('📊 Cột trong bảng services:');
    servicesColumns.forEach(col => {
      console.log(`   - ${col.Field}: ${col.Type}`);
    });
    
    // Kiểm tra bảng stylists
    const [stylistsColumns] = await connection.execute('DESCRIBE stylists');
    console.log('\n📊 Cột trong bảng stylists:');
    stylistsColumns.forEach(col => {
      console.log(`   - ${col.Field}: ${col.Type}`);
    });
    
    // Kiểm tra dữ liệu
    const [services] = await connection.execute('SELECT COUNT(*) as count FROM services');
    const [stylists] = await connection.execute('SELECT COUNT(*) as count FROM stylists');
    const [users] = await connection.execute('SELECT COUNT(*) as count FROM users');
    
    console.log('\n📊 Số lượng dữ liệu:');
    console.log(`   - Services: ${services[0].count}`);
    console.log(`   - Stylists: ${stylists[0].count}`);
    console.log(`   - Users: ${users[0].count}`);
    
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkDatabase(); 