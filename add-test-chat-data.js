const mysql = require('mysql2/promise');

async function addTestChatData() {
    let connection;
    
    try {
        // Kết nối database
        connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '11223344',
            database: 'salon_db'
        });

        console.log('✅ Đã kết nối database thành công');

        // Thêm dữ liệu test cho chat
        const testMessages = [
            // Customer 1 chat với Admin
            [1, 'customer', 1, 'admin', 'Chào admin, tôi muốn hỏi về dịch vụ cắt tóc'],
            [1, 'admin', 1, 'customer', 'Chào bạn! Tôi có thể giúp gì cho bạn về dịch vụ cắt tóc?'],
            [1, 'customer', 1, 'admin', 'Giá cắt tóc là bao nhiêu vậy?'],
            [1, 'admin', 1, 'customer', 'Giá cắt tóc từ 90,000 VNĐ bạn nhé!'],
            [1, 'customer', 1, 'admin', 'Có thể đặt lịch online không?'],
            [1, 'admin', 1, 'customer', 'Có bạn! Bạn có thể đặt lịch trực tiếp trên website hoặc gọi điện cho chúng tôi'],
            
            // Customer 2 chat với Admin
            [2, 'customer', 1, 'admin', 'Chào admin, tôi muốn đặt lịch'],
            [1, 'admin', 2, 'customer', 'Chào bạn! Bạn muốn đặt lịch dịch vụ gì?'],
            [2, 'customer', 1, 'admin', 'Tôi muốn đặt lịch nhuộm tóc'],
            [1, 'admin', 2, 'customer', 'Bạn muốn nhuộm màu gì? Chúng tôi có nhiều màu đẹp'],
            [2, 'customer', 1, 'admin', 'Tôi muốn nhuộm màu nâu sáng'],
            [1, 'admin', 2, 'customer', 'Tuyệt! Màu nâu sáng rất phù hợp. Bạn muốn đặt lịch ngày nào?'],
            
            // Customer 3 chat với Admin
            [3, 'customer', 1, 'admin', 'Chào admin, tôi có câu hỏi về dịch vụ uốn tóc'],
            [1, 'admin', 3, 'customer', 'Chào bạn! Bạn muốn hỏi gì về dịch vụ uốn tóc?'],
            [3, 'customer', 1, 'admin', 'Uốn tóc có hại cho tóc không?'],
            [1, 'admin', 3, 'customer', 'Uốn tóc hiện đại rất an toàn, chúng tôi sử dụng hóa chất chất lượng cao'],
            [3, 'customer', 1, 'admin', 'Cảm ơn admin, tôi sẽ cân nhắc'],
            [1, 'admin', 3, 'customer', 'Không có gì! Nếu có thắc mắc gì cứ hỏi nhé']
        ];

        console.log('📝 Đang thêm dữ liệu test...');

        for (const message of testMessages) {
            await connection.execute(
                'INSERT INTO chat_messages (sender_id, sender_type, receiver_id, receiver_type, message) VALUES (?, ?, ?, ?, ?)',
                message
            );
        }

        console.log('✅ Đã thêm ' + testMessages.length + ' tin nhắn test thành công');

        // Hiển thị thống kê
        const [stats] = await connection.execute('SELECT COUNT(*) as total FROM chat_messages');
        const [customerStats] = await connection.execute('SELECT COUNT(DISTINCT sender_id) as customers FROM chat_messages WHERE sender_type = "customer"');
        
        console.log('📊 Thống kê chat:');
        console.log('- Tổng số tin nhắn:', stats[0].total);
        console.log('- Số khách hàng đã chat:', customerStats[0].customers);

        // Hiển thị một số tin nhắn mẫu
        const [recentMessages] = await connection.execute(`
            SELECT * FROM chat_messages 
            ORDER BY created_at DESC 
            LIMIT 5
        `);
        
        console.log('\n📋 Tin nhắn gần đây:');
        recentMessages.forEach(msg => {
            console.log(`- ${msg.sender_type} #${msg.sender_id}: ${msg.message}`);
        });

        console.log('\n🎉 Hoàn tất thêm dữ liệu test!');
        console.log('💡 Admin có thể truy cập /chat/admin để xem và trả lời tin nhắn');

    } catch (error) {
        console.error('❌ Lỗi:', error.message);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

addTestChatData();

