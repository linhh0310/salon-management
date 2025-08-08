# Hệ Thống Quản Lý Giỏ Hàng - LYN Salon

## Vấn Đề Đã Được Giải Quyết

### Vấn đề ban đầu:
- Giỏ hàng được lưu trong localStorage của trình duyệt
- Khi đăng nhập tài khoản mới, giỏ hàng vẫn giữ nguyên dữ liệu của tài khoản cũ
- Không có sự liên kết giữa giỏ hàng và tài khoản đăng nhập

### Giải pháp đã triển khai:

## 1. Hệ Thống Quản Lý Giỏ Hàng Tập Trung

### File: `public/js/cart-manager.js`
- **CartManager Class**: Quản lý toàn bộ logic giỏ hàng
- **Tính năng chính**:
  - Tự động load giỏ hàng của user khi đăng nhập
  - Lưu giỏ hàng riêng biệt cho từng user
  - Xử lý chuyển đổi giỏ hàng khi đăng nhập user khác
  - Tự động lưu giỏ hàng khi có thay đổi

### Cách hoạt động:

#### Khi đăng nhập:
1. **Kiểm tra user hiện tại**: So sánh với user trước đó
2. **Xử lý giỏ hàng**: 
   - Nếu đăng nhập user khác → Hỏi có muốn chuyển giỏ hàng không
   - Load giỏ hàng của user mới nếu có
3. **Lưu thông tin tracking**: Để theo dõi user và giỏ hàng

#### Khi đăng xuất:
1. **Lưu giỏ hàng hiện tại** cho user
2. **Xóa thông tin user** hiện tại
3. **Xóa giỏ hàng** hiện tại

#### Khi thêm/xóa sản phẩm:
1. **Cập nhật giỏ hàng** trong localStorage
2. **Tự động lưu** cho user hiện tại
3. **Cập nhật hiển thị** số lượng

## 2. Cấu Trúc Dữ Liệu

### localStorage Keys:
- `cart`: Giỏ hàng hiện tại
- `currentUser`: Thông tin user đang đăng nhập
- `userCart_{userId}`: Giỏ hàng riêng của từng user
- `lastUserId`: ID của user trước đó
- `lastUserCart`: Giỏ hàng của user trước đó

### Ví dụ:
```javascript
// Giỏ hàng hiện tại
localStorage.setItem('cart', JSON.stringify([...]))

// Thông tin user
localStorage.setItem('currentUser', JSON.stringify({
  id: 1,
  name: "Nguyễn Văn A",
  email: "user@example.com",
  role: "customer"
}))

// Giỏ hàng của user ID 1
localStorage.setItem('userCart_1', JSON.stringify([...]))
```

## 3. Tích Hợp Vào Hệ Thống

### File đã được cập nhật:
1. **`views/partials/header.ejs`**:
   - Thêm script cart-manager.js
   - Cập nhật logic đăng nhập/đăng ký
   - Sử dụng CartManager thay vì logic cũ

2. **`views/cart.ejs`**:
   - Tự động load giỏ hàng của user
   - Tự động lưu khi có thay đổi

3. **`views/products.ejs`**:
   - Tự động load giỏ hàng của user
   - Tự động lưu khi thêm sản phẩm

4. **`controllers/userController.js`**:
   - Trả về thông tin user khi đăng nhập/đăng ký thành công

## 4. Luồng Hoạt Động

### Kịch bản 1: Đăng nhập lần đầu
1. User đăng nhập → Tạo session
2. CartManager.loadUserCart() → Load giỏ hàng của user (nếu có)
3. Hiển thị giỏ hàng của user

### Kịch bản 2: Chuyển đổi tài khoản
1. User A đang có giỏ hàng → Đăng xuất
2. User B đăng nhập → Hỏi có muốn chuyển giỏ hàng không
3. Nếu đồng ý → Lưu giỏ hàng của A cho B
4. Nếu không → Xóa giỏ hàng, load giỏ hàng của B

### Kịch bản 3: Thêm sản phẩm
1. User thêm sản phẩm → Cập nhật localStorage
2. CartManager.saveUserCart() → Lưu cho user hiện tại
3. Cập nhật hiển thị số lượng

## 5. Lợi Ích

### Cho người dùng:
- ✅ Giỏ hàng được lưu riêng cho từng tài khoản
- ✅ Không bị mất dữ liệu khi chuyển đổi tài khoản
- ✅ Có tùy chọn chuyển giỏ hàng giữa các tài khoản
- ✅ Trải nghiệm mua sắm liền mạch

### Cho developer:
- ✅ Code tập trung, dễ bảo trì
- ✅ Logic rõ ràng, dễ debug
- ✅ Có thể mở rộng thêm tính năng
- ✅ Tương thích với hệ thống hiện tại

## 6. Hướng Dẫn Sử Dụng

### Để test hệ thống:
1. **Tạo 2 tài khoản khác nhau**
2. **Đăng nhập tài khoản A** → Thêm sản phẩm vào giỏ hàng
3. **Đăng xuất** → Đăng nhập tài khoản B
4. **Kiểm tra**: Giỏ hàng sẽ hỏi có muốn chuyển không
5. **Đồng ý chuyển** → Giỏ hàng của A sẽ chuyển sang B
6. **Từ chối** → Giỏ hàng trống, load giỏ hàng của B (nếu có)

### Để debug:
1. Mở Developer Tools → Application → Local Storage
2. Kiểm tra các key: `cart`, `currentUser`, `userCart_*`
3. Xem console log để theo dõi luồng hoạt động

## 7. Tương Lai

### Có thể mở rộng:
- Lưu giỏ hàng vào database thay vì localStorage
- Thêm tính năng đồng bộ giỏ hàng
- Thêm tính năng lưu danh sách yêu thích
- Thêm tính năng gợi ý sản phẩm dựa trên lịch sử

### Tối ưu hóa:
- Sử dụng IndexedDB thay vì localStorage cho dữ liệu lớn
- Thêm cache để tăng tốc độ
- Thêm offline support


