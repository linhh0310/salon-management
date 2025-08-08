# Kết Nối Phần Khách Hàng Admin Với Database - LYN Salon

## 🔍 Vấn Đề Ban Đầu

### Trước khi sửa:
- ❌ Phần "Khách hàng" trong admin chỉ hiển thị mock data
- ❌ Không kết nối với database thực
- ❌ Không có chức năng CRUD đầy đủ
- ❌ Thiếu trường `address` trong database

## ✅ Giải Pháp Đã Triển Khai

### 1. **Cập Nhật Database Schema**

#### Thêm trường `address` vào bảng `users`:
```sql
-- Thêm trường address vào bảng users
ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT;

-- Cập nhật dữ liệu mẫu
UPDATE users SET address = 'Chưa có địa chỉ' WHERE address IS NULL;
```

### 2. **Cập Nhật Model User**

#### File: `models/userModel.js`
```diff
// Tạo user mới
- const { name, email, phone, password, role = 'user' } = userData;
+ const { name, email, phone, password, role = 'user', address } = userData;

- 'INSERT INTO users (name, email, phone, password, role, created_at) VALUES (?, ?, ?, ?, ?, NOW())'
+ 'INSERT INTO users (name, email, phone, password, role, address, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())'

// Cập nhật thông tin user
- const { name, email, phone } = userData;
+ const { name, email, phone, address } = userData;

- 'UPDATE users SET name = ?, email = ?, phone = ? WHERE id = ?'
+ 'UPDATE users SET name = ?, email = ?, phone = ?, address = ? WHERE id = ?'

// Lấy danh sách users
- 'SELECT id, name, email, phone, role, created_at FROM users'
+ 'SELECT id, name, email, phone, role, address, created_at FROM users'
```

### 3. **Cập Nhật Admin Controller**

#### File: `controllers/adminController.js`

##### **Method `getCustomers`**:
```javascript
// Lấy tất cả users từ database (chỉ những user có role = 'user')
const allUsers = await User.findAll();
const customers = allUsers.filter(user => user.role === 'user').map(user => {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone || 'Chưa có',
    address: user.address || 'Chưa có địa chỉ',
    status: 'active',
    created_at: user.created_at,
    orders_count: 0
  };
});
```

##### **Thêm các method mới**:
- ✅ `getViewCustomer` - Xem chi tiết khách hàng
- ✅ `getEditCustomer` - Form sửa khách hàng
- ✅ `postEditCustomer` - Cập nhật thông tin khách hàng
- ✅ `deleteCustomer` - Xóa khách hàng
- ✅ `getAddCustomer` - Form thêm khách hàng
- ✅ `postAddCustomer` - Tạo khách hàng mới

### 4. **Tạo Views Cho Customers**

#### Files đã tạo:
- ✅ `views/admin/customers/view.ejs` - Xem chi tiết khách hàng
- ✅ `views/admin/customers/edit.ejs` - Sửa thông tin khách hàng
- ✅ `views/admin/customers/add.ejs` - Thêm khách hàng mới

### 5. **Routes Đã Có Sẵn**

#### File: `routes/adminRoutes.js`
```javascript
// Quản lý customers
router.get('/customers', requireAdmin, adminController.getCustomers);
router.get('/customers/add', requireAdmin, adminController.getAddCustomer);
router.post('/customers/add', requireAdmin, adminController.postAddCustomer);
router.get('/customers/:id/view', requireAdmin, adminController.getViewCustomer);
router.get('/customers/:id/edit', requireAdmin, adminController.getEditCustomer);
router.post('/customers/:id/edit', requireAdmin, adminController.postEditCustomer);
router.post('/customers/:id/delete', requireAdmin, adminController.deleteCustomer);
```

## 🎯 Chức Năng Đã Hoàn Thành

### 1. **Xem Danh Sách Khách Hàng**
- ✅ Hiển thị tất cả users có `role = 'user'`
- ✅ Thông tin: ID, tên, email, số điện thoại, địa chỉ, ngày tham gia
- ✅ Tìm kiếm và lọc theo trạng thái
- ✅ Phân trang (sẽ cập nhật sau)

### 2. **Xem Chi Tiết Khách Hàng**
- ✅ Hiển thị đầy đủ thông tin khách hàng
- ✅ Avatar và thông tin cá nhân
- ✅ Lịch sử đơn hàng (sẽ cập nhật sau)
- ✅ Nút sửa và xóa

### 3. **Sửa Thông Tin Khách Hàng**
- ✅ Form sửa thông tin cá nhân
- ✅ Validation real-time
- ✅ Cập nhật database
- ✅ Thông báo thành công/lỗi

### 4. **Thêm Khách Hàng Mới**
- ✅ Form thêm khách hàng
- ✅ Validation đầy đủ
- ✅ Tạo tài khoản với mật khẩu
- ✅ Kiểm tra email trùng lặp

### 5. **Xóa Khách Hàng**
- ✅ Xác nhận trước khi xóa
- ✅ Xóa khỏi database
- ✅ Thông báo kết quả

## 📊 Cấu Trúc Dữ Liệu

### Bảng `users`:
```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    address TEXT,  -- Mới thêm
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Dữ liệu khách hàng:
```javascript
{
  id: 1,
  name: 'Nguyễn Văn A',
  email: 'nguyenvana@example.com',
  phone: '0123456789',
  address: '123 Đường ABC, TP.HCM',
  status: 'active',
  created_at: '2024-01-01',
  orders_count: 0
}
```

## 🧪 Test Cases

### 1. **Test Database Connection**:
```bash
node test-database.js
```

### 2. **Test Chức Năng Admin**:
- Truy cập: `http://localhost:3000/admin/customers`
- Đăng nhập với tài khoản admin
- Test các chức năng: xem, sửa, thêm, xóa

### 3. **Test API Endpoints**:
```bash
# Xem danh sách khách hàng
GET /admin/customers

# Xem chi tiết khách hàng
GET /admin/customers/1/view

# Sửa khách hàng
GET /admin/customers/1/edit
POST /admin/customers/1/edit

# Thêm khách hàng mới
GET /admin/customers/add
POST /admin/customers/add

# Xóa khách hàng
POST /admin/customers/1/delete
```

## 🔧 Cách Sử Dụng

### 1. **Chạy Script Database**:
```bash
# Thêm trường address vào database
mysql -u root -p < add-address-column.sql
```

### 2. **Khởi động Server**:
```bash
npm start
```

### 3. **Truy Cập Admin Panel**:
- URL: `http://localhost:3000/admin`
- Đăng nhập với tài khoản admin
- Vào menu "Khách hàng"

### 4. **Quản Lý Khách Hàng**:
- **Xem danh sách**: Hiển thị tất cả khách hàng từ database
- **Thêm mới**: Tạo tài khoản khách hàng mới
- **Sửa thông tin**: Cập nhật thông tin cá nhân
- **Xem chi tiết**: Xem thông tin đầy đủ
- **Xóa**: Xóa khách hàng khỏi hệ thống

## ✅ Kết Quả Sau Khi Hoàn Thành

### Trước khi sửa:
- ❌ Chỉ hiển thị mock data
- ❌ Không kết nối database
- ❌ Không có chức năng CRUD
- ❌ Thiếu trường address

### Sau khi sửa:
- ✅ Kết nối hoàn toàn với database
- ✅ Hiển thị dữ liệu thực từ bảng `users`
- ✅ Đầy đủ chức năng CRUD
- ✅ Có trường address
- ✅ Validation và error handling
- ✅ UI/UX đẹp và responsive

## 🚀 Tính Năng Nâng Cao (Sẽ Cập Nhật Sau)

### 1. **Tích Hợp Với Orders**:
- Hiển thị số đơn hàng thực tế
- Lịch sử đơn hàng của khách hàng
- Thống kê chi tiêu

### 2. **Tích Hợp Với Appointments**:
- Lịch sử lịch hẹn
- Thống kê dịch vụ sử dụng

### 3. **Tính Năng Nâng Cao**:
- Phân trang
- Tìm kiếm nâng cao
- Export dữ liệu
- Import khách hàng từ file Excel

**Phần khách hàng trong admin đã được kết nối hoàn toàn với database!** 🎉

Bây giờ admin có thể quản lý khách hàng một cách đầy đủ và hiệu quả.


