const db = require('./config/db');

async function updateDatabase() {
    try {
        console.log('🔄 Bắt đầu cập nhật database...');
        
        // Thêm trường address vào bảng users
        console.log('📝 Thêm trường address vào bảng users...');
        try {
            await db.execute('ALTER TABLE users ADD COLUMN address TEXT');
            console.log('✅ Đã thêm trường address');
        } catch (error) {
            if (error.code === 'ER_DUP_FIELDNAME') {
                console.log('ℹ️ Trường address đã tồn tại');
            } else {
                throw error;
            }
        }
        
        // Cập nhật dữ liệu mẫu cho trường address
        console.log('📝 Cập nhật dữ liệu mẫu cho trường address...');
        await db.execute("UPDATE users SET address = 'Chưa có địa chỉ' WHERE address IS NULL");
        console.log('✅ Đã cập nhật dữ liệu mẫu');
        
        // Hiển thị cấu trúc bảng sau khi cập nhật
        console.log('📋 Cấu trúc bảng users sau khi cập nhật:');
        const [columns] = await db.execute('DESCRIBE users');
        columns.forEach(col => {
            console.log(`   - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : ''} ${col.Key === 'PRI' ? 'PRIMARY KEY' : ''} ${col.Key === 'UNI' ? 'UNIQUE' : ''}`);
        });
        
        // Hiển thị dữ liệu hiện có
        console.log('\n📊 Dữ liệu users hiện có:');
        const [users] = await db.execute('SELECT id, name, email, role, address FROM users');
        users.forEach(user => {
            console.log(`   - ID: ${user.id}, Name: ${user.name}, Email: ${user.email}, Role: ${user.role}, Address: ${user.address}`);
        });
        
        console.log('\n🎉 Cập nhật database thành công!');
        
    } catch (error) {
        console.error('❌ Lỗi khi cập nhật database:', error);
    } finally {
        // Đóng kết nối
        await db.end();
        console.log('\n🔌 Đã đóng kết nối database');
    }
}

// Chạy cập nhật
updateDatabase().catch(console.error); 