# 🏪 Salon Management System

Hệ thống quản lý salon tóc với đầy đủ tính năng: đăng ký/đăng nhập, quản lý sản phẩm, đặt lịch, chat real-time, và admin dashboard.

## ✨ Tính năng chính

### 👥 User Features
- **Đăng ký/Đăng nhập**: Hệ thống authentication hoàn chỉnh
- **Giỏ hàng**: Quản lý sản phẩm với localStorage
- **Chat Real-time**: Chat với admin qua widget
- **Đặt lịch**: Đặt lịch dịch vụ salon
- **Xem sản phẩm**: Danh sách và chi tiết sản phẩm

### 🛠️ Admin Features
- **Dashboard**: Thống kê tổng quan
- **Quản lý khách hàng**: CRUD operations
- **Quản lý sản phẩm**: Thêm/sửa/xóa sản phẩm
- **Quản lý dịch vụ**: Quản lý các dịch vụ salon
- **Chat System**: Nhận và trả lời tin nhắn từ khách hàng
- **Quản lý đặt lịch**: Xem và xử lý đặt lịch

## 🚀 Cài đặt

### Yêu cầu hệ thống
- Node.js (v14+)
- MySQL (v8.0+)
- npm hoặc yarn

### Bước 1: Clone repository
```bash
git clone https://github.com/your-username/salon-management.git
cd salon-management
```

### Bước 2: Cài đặt dependencies
```bash
npm install
```

### Bước 3: Cấu hình database
1. Tạo database MySQL tên `salon_db`
2. Import file `database.sql` để tạo bảng
3. Cập nhật thông tin database trong `config/db.js`

### Bước 4: Chạy ứng dụng
```bash
npm start
```

Truy cập: `http://localhost:3000`

## 📁 Cấu trúc dự án

```
salon-management/
├── config/
│   └── db.js                 # Cấu hình database
├── controllers/
│   ├── adminController.js     # Logic admin
│   ├── userController.js      # Logic user
│   ├── productController.js   # Logic sản phẩm
│   └── chatController.js      # Logic chat
├── models/
│   ├── userModel.js          # Model user
│   ├── productModel.js       # Model sản phẩm
│   ├── chatModel.js          # Model chat
│   └── contactModel.js       # Model contact
├── routes/
│   ├── userRoutes.js         # Routes user
│   ├── adminRoutes.js        # Routes admin
│   ├── productRoutes.js      # Routes sản phẩm
│   └── chatRoutes.js         # Routes chat
├── views/
│   ├── admin/                # Views admin
│   ├── partials/             # Components chung
│   └── *.ejs                # Views chính
├── public/
│   ├── css/                  # Stylesheets
│   ├── js/                   # JavaScript
│   └── images/               # Hình ảnh
└── app.js                    # Entry point
```

## 🛠️ Công nghệ sử dụng

- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **Template Engine**: EJS
- **Authentication**: express-session, bcryptjs
- **Validation**: express-validator
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Real-time**: Polling (có thể upgrade lên WebSocket)

## 📊 Database Schema

### Bảng chính
- `users`: Thông tin người dùng (customer/admin)
- `products`: Sản phẩm salon
- `services`: Dịch vụ salon
- `appointments`: Đặt lịch
- `chat_messages`: Tin nhắn chat
- `contacts`: Tin nhắn liên hệ

## 🔧 API Endpoints

### User APIs
- `POST /register` - Đăng ký
- `POST /login` - Đăng nhập
- `GET /logout` - Đăng xuất
- `GET /products` - Danh sách sản phẩm
- `POST /cart/add` - Thêm vào giỏ hàng

### Chat APIs
- `POST /chat/send` - Gửi tin nhắn
- `GET /chat/messages/:id/:type` - Lấy tin nhắn
- `GET /chat/unread` - Tin nhắn chưa đọc
- `GET /chat/admin-id` - Lấy admin ID

### Admin APIs
- `GET /admin/*` - Admin dashboard
- `POST /admin/products/*` - Quản lý sản phẩm
- `POST /admin/services/*` - Quản lý dịch vụ
- `GET /admin/customers` - Danh sách khách hàng

## 🎨 Tính năng nổi bật

### 1. Chat System
- Widget chat real-time
- Lưu trữ tin nhắn trong database
- Admin có thể trả lời từ dashboard
- Notification cho tin nhắn mới

### 2. Cart Management
- Lưu trữ theo user (localStorage)
- Tự động reset khi đăng nhập user khác
- Tính tổng tiền và số lượng

### 3. Service Categorization
- Phân loại dịch vụ: "Dịch vụ tóc" và "Thư giãn & Chăm sóc da"
- Hiển thị động theo tên dịch vụ

### 4. Admin Dashboard
- Thống kê tổng quan
- Quản lý CRUD đầy đủ
- Giao diện responsive

## 🚀 Deployment

### Local Development
```bash
npm start
```

### Production
```bash
NODE_ENV=production npm start
```

## 🤝 Đóng góp

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

## 📞 Liên hệ

- **Email**: your-email@example.com
- **GitHub**: [@your-username](https://github.com/your-username)

## 🙏 Acknowledgments

- Express.js team
- MySQL community
- EJS template engine
- Font Awesome icons 