-- Tạo bảng employees
CREATE TABLE IF NOT EXISTS employees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id VARCHAR(20) UNIQUE NOT NULL COMMENT 'Mã nhân viên',
  full_name VARCHAR(100) NOT NULL COMMENT 'Họ và tên',
  email VARCHAR(100) UNIQUE COMMENT 'Email',
  phone VARCHAR(20) COMMENT 'Số điện thoại',
  address TEXT COMMENT 'Địa chỉ',
  birth_date DATE COMMENT 'Ngày sinh',
  birth_place VARCHAR(100) COMMENT 'Nơi sinh',
  id_card VARCHAR(20) UNIQUE COMMENT 'Số CMND/CCCD',
  issue_date DATE COMMENT 'Ngày cấp CMND',
  issue_place VARCHAR(100) COMMENT 'Nơi cấp CMND',
  gender ENUM('male', 'female', 'other') COMMENT 'Giới tính',
  position ENUM('admin', 'manager', 'staff', 'stylist', 'receptionist') DEFAULT 'staff' COMMENT 'Chức vụ',
  qualification ENUM('high_school', 'college', 'university', 'master', 'phd') COMMENT 'Bằng cấp',
  marital_status ENUM('single', 'married', 'divorced', 'widowed') COMMENT 'Tình trạng hôn nhân',
  photo VARCHAR(255) COMMENT 'Đường dẫn ảnh 3x4',
  status ENUM('active', 'inactive') DEFAULT 'active' COMMENT 'Trạng thái',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_employee_id (employee_id),
  INDEX idx_email (email),
  INDEX idx_phone (phone),
  INDEX idx_position (position),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bảng quản lý nhân viên';

-- Thêm dữ liệu mẫu
INSERT INTO employees (
  employee_id, full_name, email, phone, address, 
  birth_date, birth_place, id_card, issue_date, issue_place,
  gender, position, qualification, marital_status, status
) VALUES 
('NV001', 'Nguyễn Văn A', 'nguyenvana@lynsalon.com', '0123456789', '123 Đường ABC, Quận 1, TP.HCM', 
 '1990-01-15', 'TP.HCM', '123456789012', '2010-01-15', 'CA Quận 1',
 'male', 'manager', 'university', 'married', 'active'),

('NV002', 'Trần Thị B', 'tranthib@lynsalon.com', '0987654321', '456 Đường XYZ, Quận 2, TP.HCM', 
 '1992-05-20', 'Hà Nội', '987654321098', '2012-05-20', 'CA Quận 2',
 'female', 'staff', 'college', 'single', 'active'),

('NV003', 'Lê Văn C', 'levanc@lynsalon.com', '0369852147', '789 Đường DEF, Quận 3, TP.HCM', 
 '1988-12-10', 'Đà Nẵng', '456789123012', '2008-12-10', 'CA Quận 3',
 'male', 'stylist', 'university', 'married', 'active'),

('NV004', 'Phạm Thị D', 'phamthid@lynsalon.com', '0521478963', '321 Đường GHI, Quận 4, TP.HCM', 
 '1995-08-25', 'Cần Thơ', '789123456012', '2015-08-25', 'CA Quận 4',
 'female', 'receptionist', 'college', 'single', 'active'),

('NV005', 'Hoàng Văn E', 'hoangvane@lynsalon.com', '0741852963', '654 Đường JKL, Quận 5, TP.HCM', 
 '1991-03-18', 'Bình Dương', '321654987012', '2011-03-18', 'CA Quận 5',
 'male', 'staff', 'high_school', 'married', 'inactive'); 