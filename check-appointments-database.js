const mysql = require('mysql2/promise');

async function checkAppointmentsDatabase() {
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

        // Kiểm tra bảng appointments
        console.log('\n📋 Kiểm tra bảng appointments:');
        const [appointmentTables] = await connection.execute("SHOW TABLES LIKE 'appointments'");
        
        if (appointmentTables.length === 0) {
            console.log('❌ Bảng appointments không tồn tại!');
            console.log('🔧 Đang tạo bảng appointments...');
            
            const createTableSQL = `
                CREATE TABLE appointments (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NOT NULL,
                    service_id INT NOT NULL,
                    stylist_id INT NOT NULL,
                    appointment_date DATE NOT NULL,
                    appointment_time TIME NOT NULL,
                    notes TEXT,
                    status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
                    FOREIGN KEY (stylist_id) REFERENCES stylists(id) ON DELETE CASCADE,
                    
                    INDEX idx_user_id (user_id),
                    INDEX idx_service_id (service_id),
                    INDEX idx_stylist_id (stylist_id),
                    INDEX idx_appointment_date (appointment_date),
                    INDEX idx_status (status),
                    INDEX idx_user_date (user_id, appointment_date)
                )
            `;
            
            await connection.execute(createTableSQL);
            console.log('✅ Đã tạo bảng appointments thành công');
        } else {
            console.log('✅ Bảng appointments đã tồn tại');
        }

        // Kiểm tra bảng services
        console.log('\n📋 Kiểm tra bảng services:');
        const [serviceTables] = await connection.execute("SHOW TABLES LIKE 'services'");
        
        if (serviceTables.length === 0) {
            console.log('❌ Bảng services không tồn tại!');
            console.log('🔧 Đang tạo bảng services...');
            
            const createServicesSQL = `
                CREATE TABLE services (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    description TEXT,
                    price DECIMAL(10,2) NOT NULL,
                    duration INT DEFAULT 60,
                    category VARCHAR(100),
                    is_active BOOLEAN DEFAULT TRUE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    
                    INDEX idx_category (category),
                    INDEX idx_is_active (is_active)
                )
            `;
            
            await connection.execute(createServicesSQL);
            console.log('✅ Đã tạo bảng services thành công');
        } else {
            console.log('✅ Bảng services đã tồn tại');
        }

        // Kiểm tra bảng stylists
        console.log('\n📋 Kiểm tra bảng stylists:');
        const [stylistTables] = await connection.execute("SHOW TABLES LIKE 'stylists'");
        
        if (stylistTables.length === 0) {
            console.log('❌ Bảng stylists không tồn tại!');
            console.log('🔧 Đang tạo bảng stylists...');
            
            const createStylistsSQL = `
                CREATE TABLE stylists (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    specialization VARCHAR(255),
                    experience INT DEFAULT 0,
                    image_url VARCHAR(500),
                    is_active BOOLEAN DEFAULT TRUE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    
                    INDEX idx_is_active (is_active)
                )
            `;
            
            await connection.execute(createStylistsSQL);
            console.log('✅ Đã tạo bảng stylists thành công');
        } else {
            console.log('✅ Bảng stylists đã tồn tại');
        }

        // Kiểm tra dữ liệu trong services
        console.log('\n📊 Dữ liệu trong services:');
        const [services] = await connection.execute('SELECT * FROM services ORDER BY id LIMIT 5');
        
        if (services.length === 0) {
            console.log('❌ Không có dữ liệu services nào!');
            console.log('🔧 Đang thêm dữ liệu services...');
            
            const testServices = [
                ['Cắt tóc nam', 'Cắt tóc nam theo kiểu hiện đại', 90000, 30, 'Dịch vụ tóc'],
                ['Cắt tóc nữ', 'Cắt tóc nữ theo xu hướng mới nhất', 120000, 45, 'Dịch vụ tóc'],
                ['Nhuộm tóc', 'Nhuộm tóc với màu sắc đẹp', 250000, 120, 'Dịch vụ tóc'],
                ['Uốn tóc', 'Uốn tóc tạo kiểu', 300000, 150, 'Dịch vụ tóc'],
                ['Gội dưỡng', 'Gội và dưỡng tóc chuyên nghiệp', 80000, 60, 'Thư giãn'],
                ['Massage đầu', 'Massage thư giãn đầu và cổ', 100000, 45, 'Thư giãn']
            ];

            for (const service of testServices) {
                await connection.execute(
                    'INSERT INTO services (name, description, price, duration, category) VALUES (?, ?, ?, ?, ?)',
                    service
                );
            }
            
            console.log('✅ Đã thêm dữ liệu services thành công');
        } else {
            console.log(`✅ Có ${services.length} dịch vụ trong database`);
            console.table(services.slice(0, 3));
        }

        // Kiểm tra dữ liệu trong stylists
        console.log('\n📊 Dữ liệu trong stylists:');
        const [stylists] = await connection.execute('SELECT * FROM stylists ORDER BY id LIMIT 5');
        
        if (stylists.length === 0) {
            console.log('❌ Không có dữ liệu stylists nào!');
            console.log('🔧 Đang thêm dữ liệu stylists...');
            
            const testStylists = [
                ['Nguyễn Văn A', 'Cắt tóc nam', 5, '/images/stylist1.jpg'],
                ['Trần Thị B', 'Nhuộm tóc', 8, '/images/stylist2.jpg'],
                ['Lê Văn C', 'Uốn tóc', 6, '/images/stylist3.jpg'],
                ['Phạm Thị D', 'Gội dưỡng', 3, '/images/stylist4.jpg']
            ];

            for (const stylist of testStylists) {
                await connection.execute(
                    'INSERT INTO stylists (name, specialization, experience, image_url) VALUES (?, ?, ?, ?)',
                    stylist
                );
            }
            
            console.log('✅ Đã thêm dữ liệu stylists thành công');
        } else {
            console.log(`✅ Có ${stylists.length} stylist trong database`);
            console.table(stylists.slice(0, 3));
        }

        // Kiểm tra dữ liệu trong appointments
        console.log('\n📊 Dữ liệu trong appointments:');
        const [appointments] = await connection.execute('SELECT * FROM appointments ORDER BY created_at DESC LIMIT 5');
        
        if (appointments.length === 0) {
            console.log('❌ Không có lịch hẹn nào!');
        } else {
            console.log(`✅ Có ${appointments.length} lịch hẹn trong database`);
            console.table(appointments.slice(0, 3));
        }

        // Kiểm tra cấu trúc bảng
        console.log('\n🔍 Cấu trúc bảng appointments:');
        const [appointmentStructure] = await connection.execute('DESCRIBE appointments');
        console.table(appointmentStructure);

        console.log('\n🔍 Cấu trúc bảng services:');
        const [serviceStructure] = await connection.execute('DESCRIBE services');
        console.table(serviceStructure);

        console.log('\n🔍 Cấu trúc bảng stylists:');
        const [stylistStructure] = await connection.execute('DESCRIBE stylists');
        console.table(stylistStructure);

        console.log('\n🎉 Kiểm tra database appointments hoàn tất!');

    } catch (error) {
        console.error('❌ Lỗi:', error.message);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

checkAppointmentsDatabase();

