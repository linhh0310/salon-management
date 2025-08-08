-- Tạo bảng chat_messages cho hệ thống chat
USE salon_db;

-- Tạo bảng chat_messages
CREATE TABLE IF NOT EXISTS chat_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT NOT NULL,
    sender_type ENUM('customer', 'admin') NOT NULL,
    receiver_id INT NOT NULL,
    receiver_type ENUM('customer', 'admin') NOT NULL,
    message TEXT NOT NULL,
    message_type ENUM('text', 'image', 'file') DEFAULT 'text',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_sender (sender_id, sender_type),
    INDEX idx_receiver (receiver_id, receiver_type),
    INDEX idx_conversation (sender_id, sender_type, receiver_id, receiver_type),
    INDEX idx_created_at (created_at)
);

-- Thêm dữ liệu mẫu cho chat
INSERT INTO chat_messages (sender_id, sender_type, receiver_id, receiver_type, message) VALUES
(1, 'customer', 1, 'admin', 'Chào admin, tôi muốn hỏi về dịch vụ cắt tóc'),
(1, 'admin', 1, 'customer', 'Chào bạn! Tôi có thể giúp gì cho bạn về dịch vụ cắt tóc?'),
(1, 'customer', 1, 'admin', 'Giá cắt tóc là bao nhiêu vậy?'),
(1, 'admin', 1, 'customer', 'Giá cắt tóc từ 90,000 VNĐ bạn nhé!'),
(2, 'customer', 1, 'admin', 'Chào admin, tôi muốn đặt lịch'),
(1, 'admin', 2, 'customer', 'Chào bạn! Bạn muốn đặt lịch dịch vụ gì?');

-- Hiển thị cấu trúc bảng
DESCRIBE chat_messages;

-- Hiển thị dữ liệu mẫu
SELECT * FROM chat_messages ORDER BY created_at;

