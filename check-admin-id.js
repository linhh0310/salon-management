const mysql = require('mysql2/promise');

async function checkAdminId() {
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

        // Kiểm tra admin trong bảng users
        console.log('\n📊 Kiểm tra admin trong bảng users:');
        const [admins] = await connection.execute('SELECT id, username, email, role FROM users WHERE role = "admin"');
        
        if (admins.length === 0) {
            console.log('❌ Không có admin nào trong database!');
        } else {
            console.log(`✅ Có ${admins.length} admin trong database:`);
            admins.forEach(admin => {
                console.log(`- ID: ${admin.id}, Username: ${admin.username}, Email: ${admin.email}, Role: ${admin.role}`);
            });
        }

        // Kiểm tra customer trong bảng users
        console.log('\n📊 Kiểm tra customer trong bảng users:');
        const [customers] = await connection.execute('SELECT id, username, email, role FROM users WHERE role = "customer" LIMIT 5');
        
        if (customers.length === 0) {
            console.log('❌ Không có customer nào trong database!');
        } else {
            console.log(`✅ Có ${customers.length} customer trong database:`);
            customers.forEach(customer => {
                console.log(`- ID: ${customer.id}, Username: ${customer.username}, Email: ${customer.email}, Role: ${customer.role}`);
            });
        }

        // Kiểm tra tin nhắn chat hiện tại
        console.log('\n📊 Kiểm tra tin nhắn chat hiện tại:');
        const [messages] = await connection.execute('SELECT sender_id, sender_type, receiver_id, receiver_type, message FROM chat_messages ORDER BY created_at DESC LIMIT 10');
        
        console.log(`Có ${messages.length} tin nhắn gần đây:`);
        messages.forEach(msg => {
            console.log(`- ${msg.sender_type} #${msg.sender_id} → ${msg.receiver_type} #${msg.receiver_id}: ${msg.message}`);
        });

        console.log('\n🎉 Kiểm tra admin ID hoàn tất!');

    } catch (error) {
        console.error('❌ Lỗi:', error.message);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

checkAdminId();

