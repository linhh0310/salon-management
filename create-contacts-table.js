const mysql = require('mysql2/promise');

async function createContactsTable() {
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

        // Tạo bảng contacts
        const createTableSQL = `
            CREATE TABLE IF NOT EXISTS contacts (
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

        await connection.execute(createTableSQL);
        console.log('✅ Đã tạo bảng contacts thành công');

        // Thêm dữ liệu mẫu
        const sampleContacts = [
            ['Nguyễn Văn A', 'nguyenvana@email.com', '0123456789', 'Tôi muốn hỏi về dịch vụ cắt tóc nam'],
            ['Trần Thị B', 'tranthib@email.com', '0987654321', 'Có thể đặt lịch online không?'],
            ['Lê Văn C', 'levanc@email.com', '0369852147', 'Giá nhuộm tóc là bao nhiêu?'],
            ['Phạm Thị D', 'phamthid@email.com', '0521478963', 'Salon có mở cửa vào chủ nhật không?'],
            ['Hoàng Văn E', 'hoangvane@email.com', '0741258963', 'Tôi muốn tư vấn về kiểu tóc phù hợp']
        ];

        for (const contact of sampleContacts) {
            await connection.execute(
                'INSERT INTO contacts (name, email, phone, message) VALUES (?, ?, ?, ?)',
                contact
            );
        }

        console.log('✅ Đã thêm dữ liệu mẫu thành công');

        // Kiểm tra bảng đã tạo
        const [rows] = await connection.execute('SELECT * FROM contacts LIMIT 3');
        console.log('📋 Dữ liệu mẫu:');
        console.table(rows);

        console.log('🎉 Setup contacts table hoàn tất!');

    } catch (error) {
        console.error('❌ Lỗi:', error.message);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

createContactsTable();

