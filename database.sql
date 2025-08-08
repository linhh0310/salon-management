-- Tạo database
CREATE DATABASE IF NOT EXISTS salon_management;
USE salon_management;

-- Bảng users
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Bảng categories
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    parent_id INT DEFAULT 0,
    module VARCHAR(50) NOT NULL,
    show_home BOOLEAN DEFAULT FALSE,
    show_menu BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Bảng services
CREATE TABLE IF NOT EXISTS services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    duration INT NOT NULL, -- Thời gian tính bằng phút
    category_id INT,
    image VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Bảng stylists
CREATE TABLE IF NOT EXISTS stylists (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    experience INT DEFAULT 0, -- Số năm kinh nghiệm
    image VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Bảng products
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    quantity INT DEFAULT 0,
    category_id INT,
    image VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Bảng appointments
CREATE TABLE IF NOT EXISTS appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    service_id INT,
    stylist_id INT,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE SET NULL,
    FOREIGN KEY (stylist_id) REFERENCES stylists(id) ON DELETE SET NULL
);

-- Bảng reviews
CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    service_id INT,
    stylist_id INT,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE SET NULL,
    FOREIGN KEY (stylist_id) REFERENCES stylists(id) ON DELETE SET NULL
);

-- Bảng orders
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    shipping_address TEXT,
    payment_method VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Bảng order_items
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Bảng contact_messages
CREATE TABLE IF NOT EXISTS contact_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    subject VARCHAR(200),
    message TEXT NOT NULL,
    status ENUM('unread', 'read', 'replied') DEFAULT 'unread',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Thêm dữ liệu mẫu cho categories (phù hợp với salon)
INSERT INTO categories (name, description, parent_id, module, show_home, show_menu, is_active, sort_order) VALUES
('Dịch vụ salon', 'Các dịch vụ chính của salon', 0, 'Dịch vụ', TRUE, TRUE, TRUE, 1),
('Cắt tóc', 'Dịch vụ cắt tóc nam và nữ', 1, 'Dịch vụ', TRUE, TRUE, TRUE, 1),
('Nhuộm tóc', 'Dịch vụ nhuộm và thay đổi màu tóc', 1, 'Dịch vụ', TRUE, TRUE, TRUE, 2),
('Uốn tóc', 'Dịch vụ uốn và tạo kiểu tóc', 1, 'Dịch vụ', TRUE, TRUE, TRUE, 3),
('Chăm sóc tóc', 'Dịch vụ chăm sóc và dưỡng tóc', 1, 'Dịch vụ', TRUE, TRUE, TRUE, 4),
('Sản phẩm salon', 'Các sản phẩm chăm sóc tóc', 0, 'Sản phẩm', TRUE, TRUE, TRUE, 2),
('Dầu gội', 'Dầu gội và dầu xả', 6, 'Sản phẩm', TRUE, TRUE, TRUE, 1),
('Sản phẩm tạo kiểu', 'Gel, sáp, xịt tạo kiểu', 6, 'Sản phẩm', TRUE, TRUE, TRUE, 2),
('Dưỡng tóc', 'Serum, mask dưỡng tóc', 6, 'Sản phẩm', TRUE, TRUE, TRUE, 3),
('Lịch hẹn', 'Quản lý lịch hẹn khách hàng', 0, 'Lịch hẹn', FALSE, TRUE, TRUE, 3),
('Đơn hàng', 'Quản lý đơn hàng sản phẩm', 0, 'Đơn hàng', FALSE, TRUE, TRUE, 4),
('Đánh giá', 'Đánh giá và nhận xét khách hàng', 0, 'Đánh giá', FALSE, TRUE, TRUE, 5),
('Liên hệ', 'Tin nhắn liên hệ từ khách hàng', 0, 'Liên hệ', FALSE, TRUE, TRUE, 6);

-- Thêm dữ liệu mẫu cho users
INSERT INTO users (name, email, phone, password, role) VALUES
('Admin', 'admin@lynsalon.com', '0123456789', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'),
('Nguyễn Văn A', 'user1@example.com', '0987654321', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user'),
('Trần Thị B', 'user2@example.com', '0987654322', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user');

-- Thêm dữ liệu mẫu cho services
INSERT INTO services (name, description, price, duration, category_id) VALUES
('Cắt tóc nam', 'Cắt tóc nam cơ bản', 100000, 30, 2),
('Cắt tóc nữ', 'Cắt tóc nữ cơ bản', 150000, 45, 2),
('Nhuộm tóc', 'Nhuộm tóc với màu sắc đẹp', 300000, 120, 3),
('Uốn tóc', 'Uốn tóc tạo kiểu', 400000, 150, 4),
('Massage da đầu', 'Massage thư giãn da đầu', 200000, 60, 5),
('Gội đầu', 'Gội đầu và dưỡng tóc', 80000, 30, 5);

-- Thêm dữ liệu mẫu cho stylists
INSERT INTO stylists (name, phone, email, experience, image) VALUES
('Nguyễn Thị Hương', '0123456789', 'huong@lynsalon.com', 5, '/images/stylist.jpg'),
('Trần Văn Nam', '0987654321', 'nam@lynsalon.com', 3, '/images/stylist.jpg'),
('Lê Thị Mai', '0123456788', 'mai@lynsalon.com', 7, '/images/stylist.jpg');

-- Thêm dữ liệu mẫu cho products
INSERT INTO products (name, description, price, quantity, category_id, image) VALUES
('Dầu gội thảo dược', 'Dầu gội thảo dược tự nhiên', 150000, 50, 7, '/images/product1.jpg'),
('Dầu xả dưỡng ẩm', 'Dầu xả dưỡng ẩm cho tóc khô', 120000, 40, 7, '/images/product2.jpg'),
('Gel tạo kiểu', 'Gel tạo kiểu tóc nam', 80000, 30, 8, '/images/product3.jpg'),
('Sáp vuốt tóc', 'Sáp vuốt tóc nam cao cấp', 100000, 25, 8, '/images/product4.jpg'),
('Serum dưỡng tóc', 'Serum dưỡng tóc chuyên sâu', 200000, 20, 9, '/images/product5.jpg');

-- Thêm dữ liệu mẫu cho appointments
INSERT INTO appointments (user_id, service_id, stylist_id, appointment_date, appointment_time, status, notes) VALUES
(2, 1, 1, '2024-01-15', '09:00:00', 'confirmed', 'Khách hàng yêu cầu cắt ngắn'),
(2, 3, 2, '2024-01-16', '14:00:00', 'pending', 'Nhuộm màu nâu sáng'),
(3, 2, 3, '2024-01-17', '10:00:00', 'pending', 'Cắt tóc layer'),
(2, 4, 1, '2024-01-18', '16:00:00', 'pending', 'Uốn tóc xoăn nhẹ');

-- Thêm dữ liệu mẫu cho reviews
INSERT INTO reviews (user_id, service_id, stylist_id, rating, comment) VALUES
(2, 1, 1, 5, 'Stylist rất chuyên nghiệp, cắt tóc đẹp'),
(3, 2, 3, 4, 'Dịch vụ tốt, nhân viên thân thiện'),
(2, 3, 2, 5, 'Nhuộm tóc đẹp, màu sắc như ý');

-- Thêm dữ liệu mẫu cho orders
INSERT INTO orders (user_id, total_amount, status, shipping_address, payment_method) VALUES
(2, 350000, 'confirmed', '123 Đường ABC, Quận 1, TP.HCM', 'Tiền mặt'),
(3, 280000, 'pending', '456 Đường XYZ, Quận 2, TP.HCM', 'Chuyển khoản');

-- Thêm dữ liệu mẫu cho order_items
INSERT INTO order_items (order_id, product_id, quantity, price) VALUES
(1, 1, 2, 150000),
(1, 3, 1, 80000),
(2, 2, 1, 120000),
(2, 4, 1, 100000);

-- Thêm dữ liệu mẫu cho contact_messages
INSERT INTO contact_messages (name, email, phone, subject, message, status) VALUES
('Nguyễn Văn C', 'customer1@example.com', '0123456789', 'Đặt lịch hẹn', 'Tôi muốn đặt lịch cắt tóc vào ngày mai', 'unread'),
('Trần Thị D', 'customer2@example.com', '0987654321', 'Tư vấn dịch vụ', 'Tôi muốn tư vấn về dịch vụ nhuộm tóc', 'read');

-- Tạo indexes để tối ưu hiệu suất
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_categories_parent_id ON categories(parent_id);
CREATE INDEX idx_categories_module ON categories(module);
CREATE INDEX idx_services_category_id ON services(category_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_appointments_user_id ON appointments(user_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_contact_messages_status ON contact_messages(status);