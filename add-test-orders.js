const db = require('./config/db');

async function addTestOrders() {
  try {
    console.log('🔄 Bắt đầu thêm đơn hàng test...');
    
    // Sử dụng user ID 5 (user đang đăng nhập)
    const userId = 5;
    console.log('👤 User ID:', userId);

    const testOrders = [
      {
        user_id: userId,
        total_amount: 250000,
        shipping_address: '123 Đường ABC',
        province: 'TP. Hồ Chí Minh',
        district: 'Quận 1',
        ward: 'Phường Bến Nghé',
        full_name: 'Linh Pham',
        phone: '0123456789',
        email: 'linhpham2004xhxtnd@gmail.com',
        payment_method: 'COD',
        notes: 'Giao hàng vào buổi chiều',
        status: 'pending'
      },
      {
        user_id: userId,
        total_amount: 180000,
        shipping_address: '456 Đường XYZ',
        province: 'TP. Hồ Chí Minh',
        district: 'Quận 3',
        ward: 'Phường Võ Thị Sáu',
        full_name: 'Linh Pham',
        phone: '0987654321',
        email: 'linhpham2004xhxtnd@gmail.com',
        payment_method: 'Bank Transfer',
        notes: '',
        status: 'confirmed'
      },
      {
        user_id: userId,
        total_amount: 320000,
        shipping_address: '789 Đường DEF',
        province: 'TP. Hồ Chí Minh',
        district: 'Quận 7',
        ward: 'Phường Tân Phú',
        full_name: 'Linh Pham',
        phone: '0123456789',
        email: 'linhpham2004xhxtnd@gmail.com',
        payment_method: 'COD',
        notes: 'Giao hàng vào buổi sáng',
        status: 'shipped'
      }
    ];

    for (const orderData of testOrders) {
      const [result] = await db.execute(`
        INSERT INTO orders (user_id, total_amount, shipping_address, province, district, ward, full_name, phone, email, payment_method, notes, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `, [
        orderData.user_id,
        orderData.total_amount,
        orderData.shipping_address,
        orderData.province,
        orderData.district,
        orderData.ward,
        orderData.full_name,
        orderData.phone,
        orderData.email,
        orderData.payment_method,
        orderData.notes,
        orderData.status
      ]);
      
      const orderId = result.insertId;
      console.log('✅ Đã tạo đơn hàng #' + orderId);

      // Thêm order items cho mỗi đơn hàng
      const testItems = [
        { product_id: 1, quantity: 2, price: 125000 },
        { product_id: 2, quantity: 1, price: 180000 }
      ];
      
      for (const item of testItems) {
        await db.execute(`
          INSERT INTO order_items (order_id, product_id, quantity, price) 
          VALUES (?, ?, ?, ?)
        `, [orderId, item.product_id, item.quantity, item.price]);
      }
      console.log('✅ Đã thêm order items cho đơn hàng #' + orderId);
    }

    console.log('🎉 Hoàn thành thêm đơn hàng test!');
    console.log('📊 Tổng cộng đã thêm ' + testOrders.length + ' đơn hàng');
    
  } catch (error) {
    console.error('❌ Lỗi khi thêm đơn hàng test:', error);
  } finally {
    process.exit(0);
  }
}

addTestOrders();
