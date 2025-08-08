const db = require('./config/db');
const User = require('./models/userModel');

async function testDatabase() {
    try {
        console.log('🧪 Bắt đầu test database...');
        
        // Test 1: Kiểm tra kết nối database
        console.log('\n1️⃣ Test kết nối database...');
        const [rows] = await db.execute('SELECT 1 as test');
        console.log('✅ Kết nối database thành công:', rows[0]);
        
        // Test 2: Kiểm tra bảng users
        console.log('\n2️⃣ Test bảng users...');
        const [userRows] = await db.execute('DESCRIBE users');
        console.log('✅ Cấu trúc bảng users:');
        userRows.forEach(row => {
            console.log(`   - ${row.Field}: ${row.Type} ${row.Null === 'NO' ? 'NOT NULL' : ''} ${row.Key === 'PRI' ? 'PRIMARY KEY' : ''} ${row.Key === 'UNI' ? 'UNIQUE' : ''}`);
        });
        
        // Test 3: Kiểm tra dữ liệu hiện có
        console.log('\n3️⃣ Test dữ liệu users hiện có...');
        const [existingUsers] = await db.execute('SELECT id, name, email, role FROM users LIMIT 5');
        console.log('✅ Users hiện có:', existingUsers);
        
        // Test 4: Test tạo user mới
        console.log('\n4️⃣ Test tạo user mới...');
        const testUserData = {
            name: 'Test User ' + Date.now(),
            email: 'test' + Date.now() + '@example.com',
            phone: '0123456789',
            password: '123456',
            role: 'user'
        };
        
        console.log('📋 Dữ liệu test:', testUserData);
        
        try {
            const userId = await User.create(testUserData);
            console.log('✅ Tạo user thành công với ID:', userId);
            
            // Test 5: Kiểm tra user vừa tạo
            console.log('\n5️⃣ Test tìm user vừa tạo...');
            const createdUser = await User.findByEmail(testUserData.email);
            console.log('✅ User vừa tạo:', {
                id: createdUser.id,
                name: createdUser.name,
                email: createdUser.email,
                role: createdUser.role
            });
            
            // Test 6: Xóa user test
            console.log('\n6️⃣ Test xóa user test...');
            await User.delete(userId);
            console.log('✅ Đã xóa user test');
            
        } catch (createError) {
            console.error('❌ Lỗi khi tạo user:', createError);
            console.error('❌ Error code:', createError.code);
            console.error('❌ Error message:', createError.message);
            console.error('❌ Error sqlMessage:', createError.sqlMessage);
        }
        
        // Test 7: Kiểm tra validation
        console.log('\n7️⃣ Test validation...');
        
        // Test email trùng lặp
        try {
            const duplicateUser = await User.create({
                name: 'Duplicate User',
                email: 'admin@example.com', // Giả sử email này đã tồn tại
                phone: '0123456789',
                password: '123456',
                role: 'user'
            });
            console.log('❌ Không nên tạo được user với email trùng lặp');
        } catch (error) {
            console.log('✅ Đúng: Không thể tạo user với email trùng lặp');
            console.log('   Error code:', error.code);
            console.log('   Error message:', error.message);
        }
        
        console.log('\n🎉 Test database hoàn thành!');
        
    } catch (error) {
        console.error('❌ Lỗi trong test database:', error);
        console.error('❌ Error code:', error.code);
        console.error('❌ Error message:', error.message);
    } finally {
        // Đóng kết nối
        await db.end();
        console.log('\n🔌 Đã đóng kết nối database');
    }
}

// Chạy test
testDatabase().catch(console.error);


