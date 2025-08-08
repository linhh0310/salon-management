const mysql = require('mysql2/promise');

async function testChatFunctionality() {
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

        // Test 1: Kiểm tra dữ liệu chat hiện tại
        console.log('\n📊 Test 1: Kiểm tra dữ liệu chat hiện tại');
        const [chatMessages] = await connection.execute('SELECT * FROM chat_messages ORDER BY created_at DESC LIMIT 5');
        console.log(`Có ${chatMessages.length} tin nhắn trong database`);
        chatMessages.forEach(msg => {
            console.log(`- ${msg.sender_type} #${msg.sender_id} → ${msg.receiver_type} #${msg.receiver_id}: ${msg.message}`);
        });

        // Test 2: Test getUserChats cho admin (ID = 1)
        console.log('\n📊 Test 2: Test getUserChats cho admin (ID = 1)');
        const adminChatsQuery = `
            SELECT 
                other_user_id,
                other_user_type,
                last_message_time,
                unread_count,
                last_message
            FROM (
                SELECT DISTINCT 
                    CASE 
                        WHEN sender_id = 1 AND sender_type = 'admin' THEN receiver_id
                        ELSE sender_id
                    END as other_user_id,
                    CASE 
                        WHEN sender_id = 1 AND sender_type = 'admin' THEN receiver_type
                        ELSE sender_type
                    END as other_user_type,
                    MAX(created_at) as last_message_time,
                    COUNT(CASE WHEN is_read = 0 AND receiver_id = 1 AND receiver_type = 'admin' THEN 1 END) as unread_count,
                    SUBSTRING_INDEX(GROUP_CONCAT(message ORDER BY created_at DESC), ',', 1) as last_message
                FROM chat_messages 
                WHERE (sender_id = 1 AND sender_type = 'admin') OR (receiver_id = 1 AND receiver_type = 'admin')
                GROUP BY other_user_id, other_user_type
            ) as chat_summary
            ORDER BY last_message_time DESC
        `;
        
        const [adminChats] = await connection.execute(adminChatsQuery);
        console.log(`Admin có ${adminChats.length} cuộc hội thoại:`);
        adminChats.forEach(chat => {
            console.log(`- ${chat.other_user_type} #${chat.other_user_id}: ${chat.last_message} (${chat.unread_count} chưa đọc)`);
        });

        // Test 3: Test getUserChats cho customer (ID = 1)
        console.log('\n📊 Test 3: Test getUserChats cho customer (ID = 1)');
        const customerChatsQuery = `
            SELECT 
                other_user_id,
                other_user_type,
                last_message_time,
                unread_count,
                last_message
            FROM (
                SELECT DISTINCT 
                    CASE 
                        WHEN sender_id = 1 AND sender_type = 'customer' THEN receiver_id
                        ELSE sender_id
                    END as other_user_id,
                    CASE 
                        WHEN sender_id = 1 AND sender_type = 'customer' THEN receiver_type
                        ELSE sender_type
                    END as other_user_type,
                    MAX(created_at) as last_message_time,
                    COUNT(CASE WHEN is_read = 0 AND receiver_id = 1 AND receiver_type = 'customer' THEN 1 END) as unread_count,
                    SUBSTRING_INDEX(GROUP_CONCAT(message ORDER BY created_at DESC), ',', 1) as last_message
                FROM chat_messages 
                WHERE (sender_id = 1 AND sender_type = 'customer') OR (receiver_id = 1 AND receiver_type = 'customer')
                GROUP BY other_user_id, other_user_type
            ) as chat_summary
            ORDER BY last_message_time DESC
        `;
        
        const [customerChats] = await connection.execute(customerChatsQuery);
        console.log(`Customer có ${customerChats.length} cuộc hội thoại:`);
        customerChats.forEach(chat => {
            console.log(`- ${chat.other_user_type} #${chat.other_user_id}: ${chat.last_message} (${chat.unread_count} chưa đọc)`);
        });

        // Test 4: Test getMessages giữa customer 1 và admin 1
        console.log('\n📊 Test 4: Test getMessages giữa customer 1 và admin 1');
        const messagesQuery = `
            SELECT * FROM chat_messages 
            WHERE (sender_id = 1 AND sender_type = 'customer' AND receiver_id = 1 AND receiver_type = 'admin')
            OR (sender_id = 1 AND sender_type = 'admin' AND receiver_id = 1 AND receiver_type = 'customer')
            ORDER BY created_at ASC
        `;
        
        const [messages] = await connection.execute(messagesQuery);
        console.log(`Có ${messages.length} tin nhắn giữa customer 1 và admin 1:`);
        messages.forEach(msg => {
            console.log(`- ${msg.sender_type} #${msg.sender_id}: ${msg.message}`);
        });

        // Test 5: Thêm tin nhắn test mới
        console.log('\n📊 Test 5: Thêm tin nhắn test mới');
        const testMessages = [
            [1, 'customer', 1, 'admin', 'Test tin nhắn từ customer đến admin'],
            [1, 'admin', 1, 'customer', 'Test tin nhắn trả lời từ admin'],
            [2, 'customer', 1, 'admin', 'Test tin nhắn từ customer 2 đến admin']
        ];

        for (const message of testMessages) {
            await connection.execute(
                'INSERT INTO chat_messages (sender_id, sender_type, receiver_id, receiver_type, message) VALUES (?, ?, ?, ?, ?)',
                message
            );
        }
        
        console.log('✅ Đã thêm 3 tin nhắn test mới');

        // Test 6: Kiểm tra lại sau khi thêm
        console.log('\n📊 Test 6: Kiểm tra lại sau khi thêm tin nhắn');
        const [newAdminChats] = await connection.execute(adminChatsQuery);
        console.log(`Admin có ${newAdminChats.length} cuộc hội thoại sau khi thêm:`);
        newAdminChats.forEach(chat => {
            console.log(`- ${chat.other_user_type} #${chat.other_user_id}: ${chat.last_message} (${chat.unread_count} chưa đọc)`);
        });

        console.log('\n🎉 Test chat functionality hoàn tất!');

    } catch (error) {
        console.error('❌ Lỗi:', error.message);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

testChatFunctionality();

