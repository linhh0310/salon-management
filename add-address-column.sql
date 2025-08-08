-- Thêm trường address vào bảng users
USE salon_db;

-- Kiểm tra xem trường address đã tồn tại chưa
SELECT COLUMN_NAME 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'salon_db' 
AND TABLE_NAME = 'users' 
AND COLUMN_NAME = 'address';

-- Thêm trường address nếu chưa có
ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT;

-- Cập nhật dữ liệu mẫu cho trường address
UPDATE users SET address = 'Chưa có địa chỉ' WHERE address IS NULL;

-- Hiển thị cấu trúc bảng sau khi cập nhật
DESCRIBE users;
