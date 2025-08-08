const mysql = require('mysql2/promise');

async function addMoreProducts() {
    let connection;
    
    try {
        // Kết nối database
        connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '11223344',
            database: 'salon_db'
        });

        console.log('✅ Kết nối database thành công');

        // Thêm 20 sản phẩm mới
        const newProducts = [
            {
                name: 'Sáp vuốt tóc Glanzen Clay Matte',
                description: 'Sáp vuốt tóc với kết cấu matte tự nhiên, không bóng dầu',
                price: 298000,
                quantity: 45,
                sales_count: 65,
                category: 'Sản phẩm tóc',
                image_url: '/images/product1.jpg',
                features: '["Matte Finish", "Natural Look", "Strong Hold"]'
            },
            {
                name: 'Xịt tạo kiểu tóc Glanzen Volume',
                description: 'Xịt tạo phồng và kiểu tóc tự nhiên',
                price: 225000,
                quantity: 38,
                sales_count: 78,
                category: 'Sản phẩm tóc',
                image_url: '/images/product2.jpg',
                features: '["Volume Boost", "Natural Texture", "Heat Protection"]'
            },
            {
                name: 'Sáp vuốt tóc Kevin Murphy Night Rider',
                description: 'Sáp vuốt tóc cao cấp với độ bám dính mạnh',
                price: 425000,
                quantity: 22,
                sales_count: 42,
                category: 'Sản phẩm tóc',
                image_url: '/images/product3.jpg',
                features: '["Strong Hold", "Matte Finish", "Premium Quality"]'
            },
            {
                name: 'Tinh chất dưỡng da cho nam Glanzen Serum',
                description: 'Tinh chất dưỡng ẩm và chống lão hóa cho nam',
                price: 350000,
                quantity: 30,
                sales_count: 55,
                category: 'Sản phẩm chăm sóc da',
                image_url: '/images/product4.jpg',
                features: '["Anti-aging", "Moisturizing", "Skin Brightening"]'
            },
            {
                name: 'Combo Sáp vuốt tóc Glanzen Premium',
                description: 'Combo 3 sản phẩm sáp vuốt tóc cao cấp',
                price: 750000,
                quantity: 15,
                sales_count: 28,
                category: 'Combo sản phẩm',
                image_url: '/images/combo1.jpg',
                features: '["3 Products", "Premium Quality", "Value Pack"]'
            },
            {
                name: 'Xịt tạo phồng Glanzen Volume Plus',
                description: 'Xịt tạo phồng tóc với công thức cải tiến',
                price: 275000,
                quantity: 40,
                sales_count: 89,
                category: 'Sản phẩm tóc',
                image_url: '/images/combo2.jpg',
                features: '["Volume Boost", "Long Lasting", "Light Weight"]'
            },
            {
                name: 'Sáp vuốt tóc Glanzen Natural',
                description: 'Sáp vuốt tóc với thành phần tự nhiên',
                price: 198000,
                quantity: 55,
                sales_count: 120,
                category: 'Sản phẩm tóc',
                image_url: '/images/combo3.jpg',
                features: '["Natural Ingredients", "Gentle Hold", "Easy Wash"]'
            },
            {
                name: 'Tinh chất dưỡng da Glanzen Bright',
                description: 'Tinh chất làm sáng da và giảm thâm',
                price: 320000,
                quantity: 25,
                sales_count: 45,
                category: 'Sản phẩm chăm sóc da',
                image_url: '/images/combo4.jpg',
                features: '["Brightening", "Dark Spot Reduction", "Even Skin Tone"]'
            },
            {
                name: 'Combo Sáp vuốt tóc Glanzen Starter',
                description: 'Combo sản phẩm dành cho người mới bắt đầu',
                price: 450000,
                quantity: 35,
                sales_count: 95,
                category: 'Combo sản phẩm',
                image_url: '/images/product1.jpg',
                features: '["Beginner Friendly", "Complete Set", "Easy to Use"]'
            },
            {
                name: 'Xịt tạo kiểu tóc Glanzen Style',
                description: 'Xịt tạo kiểu tóc với độ bám dính vừa phải',
                price: 195000,
                quantity: 60,
                sales_count: 135,
                category: 'Sản phẩm tóc',
                image_url: '/images/product2.jpg',
                features: '["Medium Hold", "Flexible Style", "No Sticky Feel"]'
            },
            {
                name: 'Sáp vuốt tóc Glanzen Strong',
                description: 'Sáp vuốt tóc với độ bám dính mạnh',
                price: 245000,
                quantity: 42,
                sales_count: 88,
                category: 'Sản phẩm tóc',
                image_url: '/images/product3.jpg',
                features: '["Strong Hold", "All Day Style", "Weather Resistant"]'
            },
            {
                name: 'Tinh chất dưỡng da Glanzen Hydra',
                description: 'Tinh chất dưỡng ẩm sâu cho da khô',
                price: 280000,
                quantity: 28,
                sales_count: 52,
                category: 'Sản phẩm chăm sóc da',
                image_url: '/images/product4.jpg',
                features: '["Deep Hydration", "Dry Skin Relief", "24h Moisture"]'
            },
            {
                name: 'Combo Sáp vuốt tóc Glanzen Professional',
                description: 'Combo sản phẩm dành cho stylist chuyên nghiệp',
                price: 850000,
                quantity: 12,
                sales_count: 18,
                category: 'Combo sản phẩm',
                image_url: '/images/combo1.jpg',
                features: '["Professional Grade", "Salon Quality", "Complete Kit"]'
            },
            {
                name: 'Xịt tạo phồng Glanzen Volume Max',
                description: 'Xịt tạo phồng tóc với hiệu ứng tối đa',
                price: 325000,
                quantity: 33,
                sales_count: 67,
                category: 'Sản phẩm tóc',
                image_url: '/images/combo2.jpg',
                features: '["Maximum Volume", "Thick Hair Effect", "Long Lasting"]'
            },
            {
                name: 'Sáp vuốt tóc Glanzen Light',
                description: 'Sáp vuốt tóc nhẹ cho tóc mỏng',
                price: 175000,
                quantity: 48,
                sales_count: 105,
                category: 'Sản phẩm tóc',
                image_url: '/images/combo3.jpg',
                features: '["Light Weight", "Thin Hair Friendly", "Natural Look"]'
            },
            {
                name: 'Tinh chất dưỡng da Glanzen Anti-Acne',
                description: 'Tinh chất trị mụn và ngăn ngừa mụn',
                price: 295000,
                quantity: 26,
                sales_count: 48,
                category: 'Sản phẩm chăm sóc da',
                image_url: '/images/combo4.jpg',
                features: '["Acne Treatment", "Pore Minimizing", "Oil Control"]'
            },
            {
                name: 'Combo Sáp vuốt tóc Glanzen Travel',
                description: 'Combo sản phẩm nhỏ gọn cho du lịch',
                price: 380000,
                quantity: 20,
                sales_count: 35,
                category: 'Combo sản phẩm',
                image_url: '/images/product1.jpg',
                features: '["Travel Size", "Compact Design", "Essential Products"]'
            },
            {
                name: 'Xịt tạo kiểu tóc Glanzen Quick',
                description: 'Xịt tạo kiểu tóc nhanh cho người bận rộn',
                price: 165000,
                quantity: 65,
                sales_count: 142,
                category: 'Sản phẩm tóc',
                image_url: '/images/product2.jpg',
                features: '["Quick Style", "Time Saving", "Easy Application"]'
            },
            {
                name: 'Sáp vuốt tóc Glanzen Classic',
                description: 'Sáp vuốt tóc cổ điển với hương thơm truyền thống',
                price: 220000,
                quantity: 38,
                sales_count: 75,
                category: 'Sản phẩm tóc',
                image_url: '/images/product3.jpg',
                features: '["Classic Scent", "Traditional Style", "Reliable Hold"]'
            },
            {
                name: 'Tinh chất dưỡng da Glanzen Sensitive',
                description: 'Tinh chất dưỡng da cho da nhạy cảm',
                price: 310000,
                quantity: 22,
                sales_count: 38,
                category: 'Sản phẩm chăm sóc da',
                image_url: '/images/product4.jpg',
                features: '["Sensitive Skin", "Gentle Formula", "Hypoallergenic"]'
            }
        ];

        // Thêm từng sản phẩm vào database
        for (const product of newProducts) {
            await connection.execute(
                'INSERT INTO products (name, description, price, quantity, sales_count, category, image_url, features) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [product.name, product.description, product.price, product.quantity, product.sales_count, product.category, product.image_url, product.features]
            );
        }

        console.log('✅ Đã thêm 20 sản phẩm mới');

        // Hiển thị tổng số sản phẩm
        const [totalProducts] = await connection.execute('SELECT COUNT(*) as count FROM products');
        console.log(`📊 Tổng số sản phẩm hiện tại: ${totalProducts[0].count}`);

        // Hiển thị danh sách sản phẩm mới nhất
        const [latestProducts] = await connection.execute('SELECT id, name, price, quantity, sales_count, category FROM products ORDER BY id DESC LIMIT 10');
        
        console.log('\n🆕 10 sản phẩm mới nhất:');
        console.log('ID | Tên sản phẩm | Giá | Tồn kho | Đã bán | Danh mục');
        console.log('---|-------------|-----|---------|--------|---------');
        
        latestProducts.forEach(product => {
            console.log(`${product.id.toString().padStart(2)} | ${product.name.substring(0, 30).padEnd(30)} | ${product.price.toLocaleString('vi-VN')} | ${product.quantity.toString().padStart(7)} | ${product.sales_count.toString().padStart(6)} | ${product.category}`);
        });

    } catch (error) {
        console.error('❌ Lỗi:', error.message);
    } finally {
        if (connection) {
            await connection.end();
            console.log('🔌 Đã đóng kết nối database');
        }
    }
}

// Chạy script
addMoreProducts(); 