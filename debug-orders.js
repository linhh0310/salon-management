const mysql = require('mysql2/promise')

async function debugOrders() {
  let connection
  
  try {
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '11223344',
      database: 'salon_db'
    })

    console.log('🔍 Debug getOrders function...')

    // Simulate the parameters
    const page = 1
    const limit = 10
    const currentPage = parseInt(page) || 1
    const offset = (currentPage - 1) * limit

    console.log('📋 Parameters:')
    console.log(`- page: ${page} (type: ${typeof page})`)
    console.log(`- limit: ${limit} (type: ${typeof limit})`)
    console.log(`- currentPage: ${currentPage} (type: ${typeof currentPage})`)
    console.log(`- offset: ${offset} (type: ${typeof offset})`)

    // Test the query without WHERE clause
    console.log('\n🔍 Testing query without WHERE clause:')
    const [orders] = await connection.execute(`
      SELECT o.*, u.name as customer_name,
             (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as total_items
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
      LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
    `)

    console.log(`✅ Query successful! Found ${orders.length} orders`)

    // Test with WHERE clause
    console.log('\n🔍 Testing query with WHERE clause:')
    const search = 'test'
    const whereConditions = [`(o.id LIKE ? OR u.name LIKE ? OR u.email LIKE ?)`]
    const queryParams = [`%${search}%`, `%${search}%`, `%${search}%`]
    const whereClause = `WHERE ${whereConditions.join(' AND ')}`

    const [ordersWithSearch] = await connection.execute(`
      SELECT o.*, u.name as customer_name,
             (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as total_items
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ${whereClause}
      ORDER BY o.created_at DESC
      LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
    `, queryParams)

    console.log(`✅ Query with search successful! Found ${ordersWithSearch.length} orders`)

  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error('📋 Full error:', error)
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}

debugOrders()
