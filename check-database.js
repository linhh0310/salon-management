const mysql = require('mysql2/promise')

async function checkDatabase() {
  let connection
  
  try {
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '11223344',
      database: 'salon_db'
    })

    console.log('🔍 Kiểm tra cấu trúc database...')

    // Kiểm tra các bảng
    const [tables] = await connection.execute('SHOW TABLES')
    console.log('📋 Các bảng trong database:')
    tables.forEach(table => {
      console.log(`- ${Object.values(table)[0]}`)
    })

    // Kiểm tra cấu trúc bảng orders
    console.log('\n📋 Cấu trúc bảng orders:')
    const [orderColumns] = await connection.execute('DESCRIBE orders')
    orderColumns.forEach(col => {
      console.log(`- ${col.Field}: ${col.Type}`)
    })

    // Kiểm tra cấu trúc bảng users
    console.log('\n📋 Cấu trúc bảng users:')
    const [userColumns] = await connection.execute('DESCRIBE users')
    userColumns.forEach(col => {
      console.log(`- ${col.Field}: ${col.Type}`)
    })

    // Kiểm tra dữ liệu mẫu
    console.log('\n📋 Dữ liệu users:')
    const [users] = await connection.execute('SELECT id, name, email, role FROM users LIMIT 5')
    users.forEach(user => {
      console.log(`- ID: ${user.id}, Name: ${user.name}, Email: ${user.email}, Role: ${user.role}`)
    })

    console.log('\n📋 Dữ liệu orders:')
    const [orders] = await connection.execute('SELECT id, user_id, total_amount, status FROM orders LIMIT 5')
    orders.forEach(order => {
      console.log(`- ID: ${order.id}, User ID: ${order.user_id}, Amount: ${order.total_amount}, Status: ${order.status}`)
    })

    // Kiểm tra xem có bảng customers không
    console.log('\n🔍 Kiểm tra bảng customers:')
    try {
      const [customers] = await connection.execute('SELECT COUNT(*) as count FROM customers')
      console.log(`- Bảng customers tồn tại với ${customers[0].count} records`)
    } catch (error) {
      console.log(`- Bảng customers KHÔNG tồn tại: ${error.message}`)
    }

  } catch (error) {
    console.error('❌ Lỗi:', error.message)
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}

checkDatabase() 