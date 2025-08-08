# Sửa Lỗi "Có lỗi xảy ra khi đăng ký" - LYN Salon

## 🔍 Vấn Đề Đã Được Phát Hiện

### Lỗi chính:
- ❌ **Role không khớp**: Code sử dụng `role = 'customer'` nhưng database chỉ chấp nhận `'user'` hoặc `'admin'`
- ❌ **Error handling không chi tiết**: Chỉ hiển thị thông báo chung chung
- ❌ **Thiếu logging chi tiết**: Khó debug khi có lỗi

## ✅ Giải Pháp Đã Triển Khai

### 1. **Sửa Role Không Khớp**

#### Vấn đề:
- Database có `role ENUM('user', 'admin')`
- Code sử dụng `role = 'customer'` → Lỗi database

#### Giải pháp:
```diff
- const { name, email, phone, password, role = 'customer' } = userData;
+ const { name, email, phone, password, role = 'user' } = userData;

- const userId = await User.create({ name, email, phone, password, role: 'customer' });
+ const userId = await User.create({ name, email, phone, password, role: 'user' });

- req.session.user = { id: userId, name: name, email: email, role: 'customer' };
+ req.session.user = { id: userId, name: name, email: email, role: 'user' };
```

### 2. **Cải Thiện Error Handling**

#### Trước khi sửa:
```javascript
catch (error) {
  return res.json({
    success: false,
    message: 'Có lỗi xảy ra khi đăng ký. Vui lòng thử lại.'
  });
}
```

#### Sau khi sửa:
```javascript
catch (error) {
  let errorMessage = 'Có lỗi xảy ra khi đăng ký. Vui lòng thử lại.';
  
  // Kiểm tra loại lỗi cụ thể
  if (error.code === 'ER_DUP_ENTRY') {
    errorMessage = 'Email đã được sử dụng. Vui lòng chọn email khác.';
  } else if (error.code === 'ER_NO_REFERENCED_ROW_2') {
    errorMessage = 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.';
  } else if (error.code === 'ER_DATA_TOO_LONG') {
    errorMessage = 'Dữ liệu quá dài. Vui lòng rút gọn thông tin.';
  }
  
  return res.json({
    success: false,
    message: errorMessage,
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
}
```

### 3. **Thêm Logging Chi Tiết**

```javascript
// Trong models/userModel.js
catch (error) {
  console.error('❌ Lỗi khi tạo user:', error);
  throw error;
}
```

## 📝 Files Đã Được Sửa

### 1. `models/userModel.js`
- ✅ Sửa role mặc định từ `'customer'` thành `'user'`
- ✅ Thêm logging chi tiết cho lỗi

### 2. `controllers/userController.js`
- ✅ Sửa tất cả references từ `'customer'` thành `'user'`
- ✅ Cải thiện error handling với thông báo cụ thể
- ✅ Thêm error codes cho các loại lỗi khác nhau

### 3. `test-database.js` (Mới)
- ✅ File test để kiểm tra database connection
- ✅ Test tạo user và validation
- ✅ Debug database errors

## 🧪 Test Cases

### File: `test-database.js`
Chạy lệnh để test database:
```bash
node test-database.js
```

Test cases bao gồm:
1. ✅ Test kết nối database
2. ✅ Test cấu trúc bảng users
3. ✅ Test dữ liệu hiện có
4. ✅ Test tạo user mới
5. ✅ Test tìm user
6. ✅ Test xóa user
7. ✅ Test validation (email trùng lặp)

## 🔧 Cách Debug

### 1. **Kiểm tra logs server**:
```bash
npm start
# Xem console log khi đăng ký
```

### 2. **Test database trực tiếp**:
```bash
node test-database.js
```

### 3. **Kiểm tra database**:
```sql
-- Kiểm tra cấu trúc bảng
DESCRIBE users;

-- Kiểm tra dữ liệu
SELECT id, name, email, role FROM users;
```

## ✅ Kết Quả Sau Khi Sửa

### Trước khi sửa:
- ❌ Lỗi "Có lỗi xảy ra khi đăng ký. Vui lòng thử lại."
- ❌ Role không khớp với database
- ❌ Không biết nguyên nhân lỗi cụ thể
- ❌ Khó debug

### Sau khi sửa:
- ✅ Đăng ký thành công
- ✅ Role khớp với database (`'user'`)
- ✅ Thông báo lỗi chi tiết và rõ ràng
- ✅ Dễ debug với logging chi tiết
- ✅ Error handling tốt hơn

## 🎯 Các Loại Lỗi Được Xử Lý

### 1. **ER_DUP_ENTRY** (Email trùng lặp)
- Thông báo: "Email đã được sử dụng. Vui lòng chọn email khác."

### 2. **ER_NO_REFERENCED_ROW_2** (Dữ liệu không hợp lệ)
- Thông báo: "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại."

### 3. **ER_DATA_TOO_LONG** (Dữ liệu quá dài)
- Thông báo: "Dữ liệu quá dài. Vui lòng rút gọn thông tin."

### 4. **Lỗi khác**
- Thông báo: "Có lỗi xảy ra khi đăng ký. Vui lòng thử lại."

## 🚀 Hướng Dẫn Triển Khai

### 1. **Khởi động server**:
```bash
npm start
```

### 2. **Test chức năng đăng ký**:
- Truy cập: `http://localhost:3000/register`
- Hoặc test: `http://localhost:3000/test-registration.html`

### 3. **Test database**:
```bash
node test-database.js
```

### 4. **Kiểm tra logs**:
- Xem console log để theo dõi quá trình đăng ký
- Kiểm tra error messages chi tiết

## 📋 Checklist Kiểm Tra

- [x] Role khớp với database schema
- [x] Error handling chi tiết
- [x] Logging đầy đủ
- [x] Test cases hoạt động
- [x] Thông báo lỗi rõ ràng
- [x] Database connection ổn định
- [x] Validation hoạt động chính xác

## 🔍 Debug Tips

### Nếu vẫn có lỗi:
1. **Kiểm tra database connection**:
   ```bash
   node test-database.js
   ```

2. **Kiểm tra logs server**:
   - Xem console log khi đăng ký
   - Tìm error codes và messages

3. **Kiểm tra database schema**:
   ```sql
   DESCRIBE users;
   ```

4. **Kiểm tra dữ liệu hiện có**:
   ```sql
   SELECT * FROM users;
   ```

**Lỗi "Có lỗi xảy ra khi đăng ký" đã được sửa hoàn toàn!** 🎉

Bây giờ chức năng đăng ký sẽ hoạt động bình thường với thông báo lỗi chi tiết và rõ ràng.


