-- Cập nhật password admin thành không mã hóa
USE salon_db;

-- Cập nhật password admin từ mã hóa thành 'password'
UPDATE users 
SET password = 'password' 
WHERE email = 'admin@30shine.com';

-- Hiển thị kết quả
SELECT id, name, email, password, role FROM users WHERE email = 'admin@30shine.com'; 