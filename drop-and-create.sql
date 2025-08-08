USE salon_db;

-- Xóa các bảng cũ nếu tồn tại
DROP TABLE IF EXISTS contact_messages;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS categories;

-- Bảng categories
CREATE TABLE categories (
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

-- Bảng reviews
CREATE TABLE reviews (
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
CREATE TABLE orders (
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
CREATE TABLE order_items (
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
CREATE TABLE contact_messages (
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

-- Thêm dữ liệu mẫu cho reviews (sử dụng user_id = 6 - admin)
INSERT INTO reviews (user_id, service_id, stylist_id, rating, comment) VALUES
(6, 1, 1, 5, 'Stylist rất chuyên nghiệp, cắt tóc đẹp'),
(6, 2, 3, 4, 'Dịch vụ tốt, nhân viên thân thiện'),
(6, 3, 2, 5, 'Nhuộm tóc đẹp, màu sắc như ý');

-- Thêm dữ liệu mẫu cho orders (sử dụng user_id = 6 - admin)
INSERT INTO orders (user_id, total_amount, status, shipping_address, payment_method) VALUES
(6, 350000, 'confirmed', '123 Đường ABC, Quận 1, TP.HCM', 'Tiền mặt'),
(6, 280000, 'pending', '456 Đường XYZ, Quận 2, TP.HCM', 'Chuyển khoản');

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
CREATE INDEX idx_categories_parent_id ON categories(parent_id);
CREATE INDEX idx_categories_module ON categories(module);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_contact_messages_status ON contact_messages(status); 