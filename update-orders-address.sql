USE salon_db;

-- Thêm các cột địa chỉ chi tiết vào bảng orders
ALTER TABLE orders 
ADD COLUMN province VARCHAR(100) AFTER shipping_address,
ADD COLUMN district VARCHAR(100) AFTER province,
ADD COLUMN ward VARCHAR(100) AFTER district,
ADD COLUMN full_name VARCHAR(100) AFTER ward,
ADD COLUMN phone VARCHAR(20) AFTER full_name,
ADD COLUMN email VARCHAR(100) AFTER phone;

-- Cập nhật dữ liệu mẫu nếu có
UPDATE orders SET 
province = 'Đà Nẵng',
district = 'Hải Châu',
ward = 'Phước Ninh',
full_name = 'Khách hàng',
phone = '0123456789',
email = 'customer@example.com'
WHERE province IS NULL;

