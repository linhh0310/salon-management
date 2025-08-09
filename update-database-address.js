const db = require('./config/db');

async function updateOrdersTable() {
    try {
        console.log('🔄 Đang cập nhật bảng orders...');
        
        // Kiểm tra và thêm các cột mới
        const columns = [
            { name: 'province', type: 'VARCHAR(100)', after: 'shipping_address' },
            { name: 'district', type: 'VARCHAR(100)', after: 'province' },
            { name: 'ward', type: 'VARCHAR(100)', after: 'district' },
            { name: 'full_name', type: 'VARCHAR(100)', after: 'ward' },
            { name: 'phone', type: 'VARCHAR(20)', after: 'full_name' },
            { name: 'email', type: 'VARCHAR(100)', after: 'phone' }
        ];
        
        for (const column of columns) {
            try {
                await db.execute(`
                    ALTER TABLE orders 
                    ADD COLUMN ${column.name} ${column.type} AFTER ${column.after}
                `);
                console.log(`✅ Đã thêm cột ${column.name}`);
            } catch (error) {
                if (error.code === 'ER_DUP_FIELDNAME') {
                    console.log(`ℹ️ Cột ${column.name} đã tồn tại`);
                } else {
                    throw error;
                }
            }
        }
        
        console.log('✅ Đã thêm các cột địa chỉ mới vào bảng orders');
        
        // Cập nhật dữ liệu mẫu nếu có
        const [existingOrders] = await db.execute('SELECT COUNT(*) as count FROM orders WHERE province IS NULL');
        
        if (existingOrders[0].count > 0) {
            await db.execute(`
                UPDATE orders SET 
                province = 'Đà Nẵng',
                district = 'Hải Châu',
                ward = 'Phước Ninh',
                full_name = 'Khách hàng',
                phone = '0123456789',
                email = 'customer@example.com'
                WHERE province IS NULL
            `);
            console.log(`✅ Đã cập nhật ${existingOrders[0].count} đơn hàng với dữ liệu mẫu`);
        }
        
        console.log('🎉 Hoàn thành cập nhật database!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Lỗi khi cập nhật database:', error);
        process.exit(1);
    }
}

updateOrdersTable();
