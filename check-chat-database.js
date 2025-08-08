const mysql = require('mysql2/promise');

async function checkChatDatabase() {
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

        // Kiểm tra bảng chat_messages
        console.log('\n📋 Kiểm tra bảng chat_messages:');
        const [chatTables] = await connection.execute("SHOW TABLES LIKE 'chat_messages'");
        
        if (chatTables.length === 0) {
            console.log('❌ Bảng chat_messages không tồn tại!');
            console.log('🔧 Đang tạo bảng chat_messages...');
            
            const createTableSQL = `
                CREATE TABLE chat_messages (
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
        } else {
            console.log('✅ Bảng chat_messages đã tồn tại');
        }

        // Kiểm tra bảng contacts
        console.log('\n📋 Kiểm tra bảng contacts:');
        const [contactTables] = await connection.execute("SHOW TABLES LIKE 'contacts'");
        
        if (contactTables.length === 0) {
            console.log('❌ Bảng contacts không tồn tại!');
            console.log('🔧 Đang tạo bảng contacts...');
            
            const createContactsSQL = `
                CREATE TABLE contacts (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    email VARCHAR(255) NOT NULL,
                    phone VARCHAR(20),
                    message TEXT NOT NULL,
                    is_read BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    
                    INDEX idx_email (email),
                    INDEX idx_created_at (created_at),
                    INDEX idx_is_read (is_read)
                )
            `;
            
            await connection.execute(createContactsSQL);
            console.log('✅ Đã tạo bảng contacts thành công');
        } else {
            console.log('✅ Bảng contacts đã tồn tại');
        }

        // Kiểm tra dữ liệu trong chat_messages
        console.log('\n📊 Dữ liệu trong chat_messages:');
        const [chatMessages] = await connection.execute('SELECT * FROM chat_messages ORDER BY created_at DESC LIMIT 10');
        
        if (chatMessages.length === 0) {
            console.log('❌ Không có dữ liệu chat nào!');
            console.log('🔧 Đang thêm dữ liệu test...');
            
            const testMessages = [
                [1, 'customer', 1, 'admin', 'Chào admin, tôi muốn hỏi về dịch vụ cắt tóc'],
                [1, 'admin', 1, 'customer', 'Chào bạn! Tôi có thể giúp gì cho bạn về dịch vụ cắt tóc?'],
                [1, 'customer', 1, 'admin', 'Giá cắt tóc là bao nhiêu vậy?'],
                [1, 'admin', 1, 'customer', 'Giá cắt tóc từ 90,000 VNĐ bạn nhé!'],
                [2, 'customer', 1, 'admin', 'Chào admin, tôi muốn đặt lịch'],
                [1, 'admin', 2, 'customer', 'Chào bạn! Bạn muốn đặt lịch dịch vụ gì?']
            ];

            for (const message of testMessages) {
                await connection.execute(
                    'INSERT INTO chat_messages (sender_id, sender_type, receiver_id, receiver_type, message) VALUES (?, ?, ?, ?, ?)',
                    message
                );
            }
            
            console.log('✅ Đã thêm dữ liệu test thành công');
        } else {
            console.log(`✅ Có ${chatMessages.length} tin nhắn trong database`);
            console.table(chatMessages.slice(0, 5));
        }

        // Kiểm tra dữ liệu trong contacts
        console.log('\n📊 Dữ liệu trong contacts:');
        const [contacts] = await connection.execute('SELECT * FROM contacts ORDER BY created_at DESC LIMIT 5');
        
        if (contacts.length === 0) {
            console.log('❌ Không có dữ liệu contact nào!');
            console.log('🔧 Đang thêm dữ liệu test...');
            
            const testContacts = [
                ['Nguyễn Văn A', 'nguyenvana@email.com', '0123456789', 'Tôi muốn hỏi về dịch vụ cắt tóc nam'],
                ['Trần Thị B', 'tranthib@email.com', '0987654321', 'Có thể đặt lịch online không?'],
                ['Lê Văn C', 'levanc@email.com', '0369852147', 'Giá nhuộm tóc là bao nhiêu?']
            ];

            for (const contact of testContacts) {
                await connection.execute(
                    'INSERT INTO contacts (name, email, phone, message) VALUES (?, ?, ?, ?)',
                    contact
                );
            }
            
            console.log('✅ Đã thêm dữ liệu contact test thành công');
        } else {
            console.log(`✅ Có ${contacts.length} tin nhắn contact trong database`);
            console.table(contacts.slice(0, 3));
        }

        // Kiểm tra cấu trúc bảng
        console.log('\n🔍 Cấu trúc bảng chat_messages:');
        const [chatStructure] = await connection.execute('DESCRIBE chat_messages');
        console.table(chatStructure);

        console.log('\n🔍 Cấu trúc bảng contacts:');
        const [contactStructure] = await connection.execute('DESCRIBE contacts');
        console.table(contactStructure);

        console.log('\n🎉 Kiểm tra database hoàn tất!');

    } catch (error) {
        console.error('❌ Lỗi:', error.message);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

checkChatDatabase();

