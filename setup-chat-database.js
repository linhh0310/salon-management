const mysql = require('mysql2/promise');

async function setupChatDatabase() {
    let connection;
    
    try {
        // Kết nối database
        connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '11223344', // Password từ config
            database: 'salon_db'
        });

        console.log('✅ Đã kết nối database thành công');

        // Tạo bảng chat_messages
        const createTableSQL = `
            CREATE TABLE IF NOT EXISTS chat_messages (
                id INT AUTO_INCREMENT PRIMARY KEY,
                sender_id INT NOT NULL,
                sender_type ENUM('customer', 'admin') NOT NULL,
                receiver_id INT NOT NULL,
                receiver_type ENUM('customer', 'admin') NOT NULL,
                message TEXT NOT NULL,
                message_type ENUM('text', 'image', 'file') DEFAULT 'text',
                is_read BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                
                INDEX idx_sender (sender_id, sender_type),
                INDEX idx_receiver (receiver_id, receiver_type),
                INDEX idx_conversation (sender_id, sender_type, receiver_id, receiver_type),
                INDEX idx_created_at (created_at)
            )
        `;

        await connection.execute(createTableSQL);
        console.log('✅ Đã tạo bảng chat_messages thành công');

        // Thêm dữ liệu mẫu
        const sampleData = [
            [1, 'customer', 1, 'admin', 'Chào admin, tôi muốn hỏi về dịch vụ cắt tóc'],
            [1, 'admin', 1, 'customer', 'Chào bạn! Tôi có thể giúp gì cho bạn về dịch vụ cắt tóc?'],
            [1, 'customer', 1, 'admin', 'Giá cắt tóc là bao nhiêu vậy?'],
            [1, 'admin', 1, 'customer', 'Giá cắt tóc từ 90,000 VNĐ bạn nhé!'],
            [2, 'customer', 1, 'admin', 'Chào admin, tôi muốn đặt lịch'],
            [1, 'admin', 2, 'customer', 'Chào bạn! Bạn muốn đặt lịch dịch vụ gì?']
        ];

        for (const data of sampleData) {
            await connection.execute(
                'INSERT INTO chat_messages (sender_id, sender_type, receiver_id, receiver_type, message) VALUES (?, ?, ?, ?, ?)',
                data
            );
        }

        console.log('✅ Đã thêm dữ liệu mẫu thành công');

        // Kiểm tra bảng đã tạo
        const [rows] = await connection.execute('SELECT * FROM chat_messages LIMIT 5');
        console.log('📋 Dữ liệu mẫu:');
        console.table(rows);

        console.log('🎉 Setup chat database hoàn tất!');

    } catch (error) {
        console.error('❌ Lỗi:', error.message);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

setupChatDatabase();
