const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupProducts() {
    let connection;
    
    try {
        // Kết nối database
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'salon_db'
        });

        console.log('✅ Kết nối database thành công');

        // Tạo bảng products nếu chưa tồn tại
        const createProductsTable = `
            CREATE TABLE IF NOT EXISTS products (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(200) NOT NULL,
                description TEXT,
                price DECIMAL(10,2) NOT NULL,
                quantity INT NOT NULL DEFAULT 0 COMMENT 'Số lượng tồn kho',
                category VARCHAR(100) NOT NULL,
                image_url VARCHAR(255),
                features TEXT COMMENT 'Các tính năng sản phẩm (JSON format)',
                status ENUM('active', 'inactive') DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `;

        await connection.execute(createProductsTable);
        console.log('✅ Bảng products đã được tạo');

        // Kiểm tra xem đã có dữ liệu mẫu chưa
        const [existingProducts] = await connection.execute('SELECT COUNT(*) as count FROM products');
        
        if (existingProducts[0].count === 0) {
            // Thêm dữ liệu mẫu
            const insertProducts = `
                INSERT INTO products (name, description, price, quantity, category, image_url, features) VALUES 
                ('Xịt tạo kiểu tóc Glanzen X2 Booster', 'Xịt tạo kiểu tóc cao cấp với khả năng tạo phồng và bảo vệ tóc', 272000, 50, 'Sản phẩm tóc', '/images/glanzen-spray.jpg', '["Tạo Phòng Và Bảo Vệ Tóc", "Vòi Xịt Cao Cấp", "Mùi Hương Quyến Rũ"]'),
                ('Tinh chất dưỡng da cho nam Serum Dr.FORSKIN', 'Serum dưỡng da 7 trong 1 cho nam giới', 499000, 30, 'Sản phẩm chăm sóc da', '/images/product1.jpg', '["Dưỡng Da 7 Trong 1 Tiện Lợi", "Phục Hồi Da Cháy Nồng", "Phù Hợp Với Nhiều Loại Da"]'),
                ('Sáp vuốt tóc nam Kevin Murphy Rough Rider', 'Sáp vuốt tóc cao cấp với khả năng giữ nếp lâu bền', 319000, 25, 'Sản phẩm tóc', '/images/product2.jpg', '["Giữ nếp lâu bền", "Kết cấu tự nhiên", "Dễ gội sạch"]'),
                ('Sáp vuốt tóc Glanzen Clay Wax - Giữ nếp', 'Sáp vuốt tóc clay với khả năng giữ nếp tự nhiên', 189000, 40, 'Sản phẩm tóc', '/images/product3.jpg', '["Giữ nếp tự nhiên", "Không bết dính", "Phù hợp mọi kiểu tóc"]')
            `;

            await connection.execute(insertProducts);
            console.log('✅ Dữ liệu sản phẩm mẫu đã được thêm');
        } else {
            console.log('ℹ️ Dữ liệu sản phẩm đã tồn tại');
        }

        // Hiển thị danh sách sản phẩm
        const [products] = await connection.execute('SELECT id, name, price, quantity, category FROM products WHERE status = "active"');
        
        console.log('\n📋 Danh sách sản phẩm hiện tại:');
        console.log('ID | Tên sản phẩm | Giá | Số lượng | Danh mục');
        console.log('---|--------------|-----|----------|---------');
        
        products.forEach(product => {
            console.log(`${product.id.toString().padStart(2)} | ${product.name.substring(0, 30).padEnd(30)} | ${product.price.toLocaleString('vi-VN')} | ${product.quantity.toString().padStart(8)} | ${product.category}`);
        });

        console.log('\n🎉 Setup sản phẩm hoàn tất!');
        console.log('🌐 Truy cập: http://localhost:3000/products');

    } catch (error) {
        console.error('❌ Lỗi:', error.message);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

// Chạy setup
setupProducts(); 