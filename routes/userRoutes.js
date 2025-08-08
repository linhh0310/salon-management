const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { body } = require('express-validator');

// Middleware kiểm tra đăng nhập
const requireAuth = (req, res, next) => {
  console.log('🔍 Kiểm tra auth middleware...');
  console.log('Session ID:', req.sessionID);
  console.log('Session user:', req.session.user);
  console.log('Session data:', req.session);
  
  if (!req.session.user) {
    console.log('❌ User chưa đăng nhập, redirect to login');
    req.flash('error', 'Vui lòng đăng nhập để tiếp tục');
    return res.redirect('/login');
  }
  
  console.log('✅ User đã đăng nhập:', req.session.user.name);
  next();
};

// Validation cho đăng ký
const registerValidation = [
  body('name').notEmpty().withMessage('Tên không được để trống'),
  body('email').isEmail().withMessage('Email không hợp lệ'),
  body('phone').notEmpty().withMessage('Số điện thoại không được để trống'),
  body('password').isLength({ min: 6 }).withMessage('Mật khẩu phải có ít nhất 6 ký tự'),
  body('confirmPassword').notEmpty().withMessage('Vui lòng xác nhận mật khẩu').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Mật khẩu xác nhận không khớp');
    }
    return true;
  }).withMessage('Mật khẩu xác nhận không khớp')
];

// Validation cho đăng nhập
const loginValidation = [
  body('email').isEmail().withMessage('Email không hợp lệ'),
  body('password').notEmpty().withMessage('Mật khẩu không được để trống')
];

// Validation cho đặt lịch
const bookingValidation = [
  body('service_id').notEmpty().withMessage('Vui lòng chọn dịch vụ'),
  body('stylist_id').notEmpty().withMessage('Vui lòng chọn stylist'),
  body('appointment_date').notEmpty().withMessage('Vui lòng chọn ngày'),
  body('appointment_time').notEmpty().withMessage('Vui lòng chọn giờ')
];

// Trang chủ
router.get('/', userController.getHome);

// Đăng ký
router.get('/register', userController.getRegister);
router.post('/register', registerValidation, userController.postRegister);

// Test route để kiểm tra đăng ký
router.post('/test-register', async (req, res) => {
  try {
    console.log('🧪 Test registration route');
    console.log('📋 Body:', req.body);
    console.log('📋 Headers:', req.headers);
    
    const { name, email, phone, password } = req.body;
    
    if (!name || !email || !phone || !password) {
      return res.json({
        success: false,
        message: 'Thiếu thông tin bắt buộc',
        data: { name, email, phone, password: password ? '***' : undefined }
      });
    }
    
    const User = require('../models/userModel');
    const userId = await User.create({ name, email, phone, password, role: 'customer' });
    
    res.json({
      success: true,
      message: 'Test registration successful',
      userId: userId
    });
  } catch (error) {
    console.error('Test registration error:', error);
    res.json({
      success: false,
      message: error.message
    });
  }
});

// Đăng nhập
router.get('/login', userController.getLogin);
router.post('/login', loginValidation, userController.postLogin);

// Đăng xuất
router.get('/logout', userController.logout);

// Dashboard user (cần đăng nhập) - Đã xóa để admin chuyển thẳng đến admin dashboard
// router.get('/dashboard', requireAuth, userController.getDashboard);

// Test route để kiểm tra session
router.get('/test-session', (req, res) => {
  console.log('🧪 Test session route');
  console.log('Session ID:', req.sessionID);
  console.log('Session:', req.session);
  console.log('User:', req.session.user);
  res.json({
    sessionID: req.sessionID,
    session: req.session,
    user: req.session.user,
    message: 'Test session route working'
  });
});

// Đặt lịch hẹn (cần đăng nhập)
router.get('/book-appointment', requireAuth, userController.getBookAppointment);
router.post('/book-appointment', requireAuth, bookingValidation, userController.postBookAppointment);

// Hủy lịch hẹn (cần đăng nhập)
router.post('/cancel-appointment/:id', requireAuth, userController.cancelAppointment);

// Trang dịch vụ
router.get('/services', userController.getServices);

// Trang stylists
router.get('/stylists', userController.getStylists);

// Cart route
router.get('/cart', requireAuth, (req, res) => {
    res.render('cart', {
        title: 'Giỏ hàng',
        user: req.session.user
    });
});

module.exports = router;
