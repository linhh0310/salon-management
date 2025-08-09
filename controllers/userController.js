const User = require('../models/userModel');
const Appointment = require('../models/appointmentModel');
const Service = require('../models/serviceModel');
const Stylist = require('../models/stylistModel');
const { validationResult } = require('express-validator');
const db = require('../config/db');

class UserController {
  // Hiển thị trang chủ
  static async getHome(req, res) {
    try {
      console.log('🏠 Rendering home page...');
      console.log('Session user:', req.session.user);
      
      const services = await Service.findAll();
      const stylists = await Stylist.findActive();
      
      res.render('home', {
        title: '30 SHINE - Salon Tóc Nam',
        services,
        stylists,
        user: req.session.user
      });
    } catch (error) {
      console.error('Error in getHome:', error);
      res.status(500).render('error', { 
        message: 'Có lỗi xảy ra khi tải trang chủ',
        error: error 
      });
    }
  }

  // Hiển thị trang đăng ký
  static getRegister(req, res) {
    res.render('register', {
      title: 'Đăng ký tài khoản',
      user: req.session.user
    });
  }

  // Xử lý đăng ký
  static async postRegister(req, res) {
    try {
      console.log('📝 Bắt đầu xử lý đăng ký...');
      console.log('📋 Body data:', req.body);
      console.log('📋 Content-Type:', req.headers['content-type']);
      
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log('❌ Validation errors:', errors.array());
        
        // Check if it's an AJAX request
        if (req.headers['content-type'] && req.headers['content-type'].includes('application/json')) {
          return res.json({
            success: false,
            message: errors.array()[0].msg,
            errors: errors.array()
          });
        }
        
        return res.render('register', {
          title: 'Đăng ký tài khoản',
          errors: errors.array(),
          user: req.session.user
        });
      }

      const { name, email, phone, password } = req.body;
      console.log('✅ Validation passed, data:', { name, email, phone, password: '***' });
      console.log('📋 Raw body data:', JSON.stringify(req.body, null, 2));

      // Kiểm tra email đã tồn tại
      console.log('🔍 Kiểm tra email đã tồn tại...');
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        console.log('❌ Email đã tồn tại:', email);
        
        // Check if it's an AJAX request
        if (req.headers['content-type'] === 'application/json') {
          return res.json({
            success: false,
            message: 'Email đã được sử dụng'
          });
        }
        
        return res.render('register', {
          title: 'Đăng ký tài khoản',
          errors: [{ msg: 'Email đã được sử dụng' }],
          user: req.session.user
        });
      }

      // Tạo user mới
      console.log('🔄 Đang tạo user mới...');
      console.log('📋 Dữ liệu user:', { name, email, phone, role: 'customer' });
      
      try {
        const userId = await User.create({ name, email, phone, password, role: 'customer' });
        console.log('✅ User đã được tạo với ID:', userId);

        console.log('✅ Đăng ký thành công!');
        console.log('📋 Thông tin user đã tạo:');
        console.log(`   - ID: ${userId}`);
        console.log(`   - Name: ${name}`);
        console.log(`   - Email: ${email}`);
        console.log(`   - Phone: ${phone}`);
        console.log(`   - Role: customer`);
      } catch (createError) {
        console.error('❌ Lỗi khi tạo user:', createError);
        throw createError;
      }

      // Check if it's an AJAX request
      if (req.headers['content-type'] && req.headers['content-type'].includes('application/json')) {
        console.log('📱 Đây là AJAX request');
        
        // Không tạo session, chỉ thông báo thành công và chuyển sang đăng nhập
        console.log('✅ Đăng ký thành công! Chuyển sang trang đăng nhập...');
        
        return res.json({
          success: true,
          message: `Đăng ký thành công! Vui lòng đăng nhập để tiếp tục.`,
          redirect: '/login',
          user: {
            id: userId,
            name: name,
            email: email,
            role: 'customer'
          }
        });
      }

      // Không tạo session, chỉ thông báo thành công và chuyển sang đăng nhập
      console.log('✅ Đăng ký thành công! Chuyển sang trang đăng nhập...');
      
      // Thông báo thành công và redirect sang trang đăng nhập
      req.flash('success', `🎉 Đăng ký thành công! Vui lòng đăng nhập để tiếp tục.`);
      res.redirect('/login');
    } catch (error) {
      console.error('❌ Error in postRegister:', error);
      
      let errorMessage = 'Có lỗi xảy ra khi đăng ký. Vui lòng thử lại.';
      
      // Kiểm tra loại lỗi cụ thể
      if (error.code === 'ER_DUP_ENTRY') {
        errorMessage = 'Email đã được sử dụng. Vui lòng chọn email khác.';
      } else if (error.code === 'ER_NO_REFERENCED_ROW_2') {
        errorMessage = 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.';
      } else if (error.code === 'ER_DATA_TOO_LONG') {
        errorMessage = 'Dữ liệu quá dài. Vui lòng rút gọn thông tin.';
      }
      
      // Check if it's an AJAX request
      if (req.headers['content-type'] && req.headers['content-type'].includes('application/json')) {
        return res.json({
          success: false,
          message: errorMessage,
          error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
      }
      
      res.render('register', {
        title: 'Đăng ký tài khoản',
        errors: [{ msg: errorMessage }],
        user: req.session.user
      });
    }
  }

  // Hiển thị trang đăng nhập
  static getLogin(req, res) {
    res.render('login', {
      title: 'Đăng nhập',
      user: req.session.user
    });
  }

  // Xử lý đăng nhập
  static async postLogin(req, res) {
    try {
      console.log('🔐 Bắt đầu xử lý đăng nhập...');
      console.log('📋 Body data:', req.body);
      
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log('❌ Validation errors:', errors.array());
        
        // Check if it's an AJAX request
        if (req.headers['content-type'] && req.headers['content-type'].includes('application/json')) {
          return res.json({
            success: false,
            message: errors.array()[0].msg
          });
        }
        
        return res.render('login', {
          title: 'Đăng nhập',
          errors: errors.array(),
          user: req.session.user
        });
      }

      const { email, password } = req.body;
      console.log('✅ Validation passed, email:', email);

      // Tìm user theo email
      console.log('🔍 Đang tìm user với email:', email);
      const user = await User.findByEmail(email);
      if (!user) {
        console.log('❌ Không tìm thấy user với email:', email);
        
        // Check if it's an AJAX request
        if (req.headers['content-type'] === 'application/json') {
          return res.json({
            success: false,
            message: 'Email hoặc mật khẩu không đúng'
          });
        }
        
        return res.render('login', {
          title: 'Đăng nhập',
          errors: [{ msg: 'Email hoặc mật khẩu không đúng' }],
          user: req.session.user
        });
      }

      console.log('✅ Tìm thấy user:', user.name);

      // Kiểm tra password
      console.log('🔑 Đang kiểm tra password...');
      const isValidPassword = await User.verifyPassword(password, user.password);
      if (!isValidPassword) {
        console.log('❌ Password không đúng');
        
        // Check if it's an AJAX request
        if (req.headers['content-type'] === 'application/json') {
          return res.json({
            success: false,
            message: 'Email hoặc mật khẩu không đúng'
          });
        }
        
        return res.render('login', {
          title: 'Đăng nhập',
          errors: [{ msg: 'Email hoặc mật khẩu không đúng' }],
          user: req.session.user
        });
      }

      console.log('✅ Password đúng, đang tạo session...');

      // Lưu thông tin user vào session
      req.session.user = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      };

      console.log('✅ Session đã được tạo:', req.session.user);
      console.log('Session ID:', req.sessionID);
      console.log('Session data:', req.session);

      // Check if it's an AJAX request
      if (req.headers['content-type'] === 'application/json') {
        // Save session before sending response
        req.session.save((err) => {
          if (err) {
            console.error('❌ Error saving session:', err);
            return res.json({
              success: false,
              message: 'Có lỗi xảy ra khi lưu session'
            });
          }
          
          console.log('✅ Session saved successfully for login');
          return res.json({
            success: true,
            message: `Đăng nhập thành công! Chào mừng ${user.name} đến với LYN Salon!`,
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role
            }
          });
        });
        return;
      }

      // Thông báo thành công và redirect
      req.flash('success', `🎉 Đăng nhập thành công! Chào mừng ${user.name} đến với LYN Salon!`);
      res.redirect(user.role === 'admin' ? '/admin' : '/');
    } catch (error) {
      console.error('❌ Error in postLogin:', error);
      
      // Check if it's an AJAX request
      if (req.headers['content-type'] === 'application/json') {
        return res.json({
          success: false,
          message: 'Có lỗi xảy ra khi đăng nhập. Vui lòng thử lại.'
        });
      }
      
      res.render('login', {
        title: 'Đăng nhập',
        errors: [{ msg: 'Có lỗi xảy ra khi đăng nhập. Vui lòng thử lại.' }],
        user: req.session.user
      });
    }
  }

  // Hiển thị dashboard user
  static async getDashboard(req, res) {
    try {
      console.log('🔍 Bắt đầu getDashboard...');
      console.log('Session ID:', req.sessionID);
      console.log('Session user:', req.session.user);
      console.log('Session data:', req.session);
      
      if (!req.session.user) {
        console.log('❌ User chưa đăng nhập, redirect to login');
        return res.redirect('/login');
      }

      console.log('✅ User đã đăng nhập, lấy appointments...');
      const appointments = await Appointment.findByUserId(req.session.user.id);
      console.log('📋 Appointments found:', appointments.length);
      
      // Lấy đơn hàng của user từ MySQL
      const Order = require('../models/orderModel');
      const orders = await Order.findByUserId(req.session.user.id);
      console.log('📦 Orders found:', orders.length);
      
      console.log('🎨 Rendering userDashboard...');
      res.render('userDashboard', {
        title: 'Dashboard',
        user: req.session.user,
        appointments,
        orders
      });
      console.log('✅ Dashboard rendered successfully');
    } catch (error) {
      console.error('❌ Error in getDashboard:', error);
      res.status(500).render('error', { 
        message: 'Có lỗi xảy ra khi tải dashboard',
        error: error 
      });
    }
  }

  // Đổi mật khẩu
  static async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.session.user.id;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng nhập đầy đủ thông tin'
        });
      }

      // Lấy thông tin user hiện tại (bao gồm password)
      const [userRows] = await db.execute('SELECT * FROM users WHERE id = ?', [userId]);
      const user = userRows[0];
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy người dùng'
        });
      }

      // Kiểm tra mật khẩu hiện tại
      const bcrypt = require('bcryptjs');
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          success: false,
          message: 'Mật khẩu hiện tại không đúng'
        });
      }

      // Hash mật khẩu mới
      const saltRounds = 10;
      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

      // Cập nhật mật khẩu trong database
      await User.changePassword(userId, newPassword);

      res.json({
        success: true,
        message: 'Đổi mật khẩu thành công'
      });

    } catch (error) {
      console.error('❌ Error in changePassword:', error);
      res.status(500).json({
        success: false,
        message: 'Có lỗi xảy ra khi đổi mật khẩu'
      });
    }
  }

  // Xem chi tiết đơn hàng
  static async getOrderDetail(req, res) {
    try {
      const orderId = req.params.id;
      const userId = req.session.user.id;

      const Order = require('../models/orderModel');
      const order = await Order.findById(orderId);

      if (!order) {
        return res.status(404).render('error', {
          message: 'Không tìm thấy đơn hàng',
          error: { status: 404 }
        });
      }

      // Kiểm tra xem đơn hàng có thuộc về user hiện tại không
      if (order.user_id != userId) {
        return res.status(403).render('error', {
          message: 'Bạn không có quyền xem đơn hàng này',
          error: { status: 403 }
        });
      }

      // Lấy chi tiết sản phẩm trong đơn hàng
      const db = require('../config/db');
      const [orderItems] = await db.execute(`
        SELECT oi.*, p.name as product_name
        FROM order_items oi
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
      `, [orderId]);

      // Kiểm tra nếu request là AJAX (từ modal)
      if (req.xhr || req.headers.accept && req.headers.accept.indexOf('json') > -1) {
        return res.json({
          success: true,
          order,
          orderItems
        });
      }

      // Render trang đầy đủ nếu không phải AJAX
      res.render('orderDetail', {
        title: 'Chi tiết đơn hàng',
        user: req.session.user,
        order,
        orderItems
      });

    } catch (error) {
      console.error('❌ Error in getOrderDetail:', error);
      
      if (req.xhr || req.headers.accept && req.headers.accept.indexOf('json') > -1) {
        return res.status(500).json({
          success: false,
          message: 'Có lỗi xảy ra khi tải chi tiết đơn hàng'
        });
      }
      
      res.status(500).render('error', {
        message: 'Có lỗi xảy ra khi tải chi tiết đơn hàng',
        error: error
      });
    }
  }

  // Đặt hàng từ giỏ hàng
  static async placeOrder(req, res) {
    try {
      if (!req.session.user) {
        return res.status(401).json({ success: false, message: 'Vui lòng đăng nhập để đặt hàng' });
      }

      const { 
        cartItems, 
        shippingAddress, 
        province,
        district,
        ward,
        fullName,
        phone,
        email,
        paymentMethod, 
        notes 
      } = req.body;
      
      if (!cartItems || cartItems.length === 0) {
        return res.status(400).json({ success: false, message: 'Giỏ hàng trống' });
      }

      // Tính tổng tiền
      const totalAmount = cartItems.reduce((total, item) => {
        return total + (item.price * item.quantity);
      }, 0);

      const Order = require('../models/orderModel');
      
      // Tạo đơn hàng với thông tin địa chỉ chi tiết
      const orderData = {
        user_id: req.session.user.id,
        total_amount: totalAmount,
        shipping_address: shippingAddress,
        province: province,
        district: district,
        ward: ward,
        full_name: fullName,
        phone: phone,
        email: email,
        payment_method: paymentMethod,
        notes: notes
      };

      const orderId = await Order.create(orderData);
      
      // Tạo order_items
      await Order.createOrderItems(orderId, cartItems);

      res.json({ 
        success: true, 
        message: 'Đặt hàng thành công!',
        orderId: orderId
      });
    } catch (error) {
      console.error('Error in placeOrder:', error);
      res.status(500).json({ success: false, message: 'Có lỗi xảy ra khi đặt hàng' });
    }
  }

  // Hiển thị trang đặt lịch
  static async getBookAppointment(req, res) {
    try {
      console.log('📅 Rendering book appointment page...');
      console.log('Session user:', req.session.user);
      
      if (!req.session.user) {
        return res.redirect('/login');
      }

      const services = await Service.findAll();
      const stylists = await Stylist.findActive();
      
      res.render('bookAppointment', {
        title: 'Đặt lịch hẹn',
        user: req.session.user,
        services,
        stylists
      });
    } catch (error) {
      console.error('Error in getBookAppointment:', error);
      res.status(500).render('error', { 
        message: 'Có lỗi xảy ra khi tải trang đặt lịch',
        error: error 
      });
    }
  }

  // Xử lý đặt lịch
  static async postBookAppointment(req, res) {
    try {
      if (!req.session.user) {
        return res.redirect('/login');
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const services = await Service.findAll();
        const stylists = await Stylist.findActive();
        
        return res.render('bookAppointment', {
          title: 'Đặt lịch hẹn',
          user: req.session.user,
          services,
          stylists,
          errors: errors.array()
        });
      }

      const { service_id, stylist_id, appointment_date, appointment_time, notes } = req.body;

      // Kiểm tra stylist có lịch trống không
      const isAvailable = await Appointment.checkStylistAvailability(
        stylist_id, 
        appointment_date, 
        appointment_time
      );

      if (!isAvailable) {
        const services = await Service.findAll();
        const stylists = await Stylist.findActive();
        
        return res.render('bookAppointment', {
          title: 'Đặt lịch hẹn',
          user: req.session.user,
          services,
          stylists,
          errors: [{ msg: 'Stylist đã có lịch hẹn vào thời gian này' }]
        });
      }

      // Tạo lịch hẹn
      const appointmentId = await Appointment.create({
        user_id: req.session.user.id,
        service_id,
        stylist_id,
        appointment_date,
        appointment_time,
        notes
      });

      // Lấy thông tin chi tiết để hiển thị
      const appointment = await Appointment.findById(appointmentId);
      const service = await Service.findById(service_id);
      const stylist = await Stylist.findById(stylist_id);

      // Trả về JSON response cho AJAX
      if (req.headers['content-type'] && req.headers['content-type'].includes('application/json')) {
        return res.json({
          success: true,
          message: 'Đặt lịch hẹn thành công!',
          appointment: {
            id: appointmentId,
            service_name: service.name,
            service_price: service.price,
            stylist_name: stylist.name,
            appointment_date: appointment_date,
            appointment_time: appointment_time,
            notes: notes
          }
        });
      }

      req.flash('success', 'Đặt lịch hẹn thành công!');
      res.redirect('/');
    } catch (error) {
      console.error('Error in postBookAppointment:', error);
      res.status(500).render('error', { 
        message: 'Có lỗi xảy ra khi đặt lịch hẹn',
        error: error 
      });
    }
  }

  // Xem chi tiết lịch hẹn
  static async getAppointmentDetail(req, res) {
    try {
      console.log('🔍 getAppointmentDetail called');
      console.log('📋 Params:', req.params);
      console.log('👤 User ID:', req.session.user.id);
      
      const appointmentId = req.params.id;
      const userId = req.session.user.id;

      console.log('🔍 Fetching appointment ID:', appointmentId);
      
      // Sử dụng query trực tiếp để đảm bảo lấy đủ thông tin
      const db = require('../config/db');
      const [appointmentRows] = await db.execute(`
        SELECT a.*, s.name as service_name, s.price as service_price,
               st.name as stylist_name, u.name as customer_name
        FROM appointments a
        LEFT JOIN services s ON a.service_id = s.id
        LEFT JOIN stylists st ON a.stylist_id = st.id
        LEFT JOIN users u ON a.user_id = u.id
        WHERE a.id = ?
      `, [appointmentId]);
      
      const appointment = appointmentRows[0];
      console.log('📋 Appointment data:', appointment);

      if (!appointment) {
        console.log('❌ Appointment not found');
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy lịch hẹn'
        });
      }

      // Kiểm tra xem lịch hẹn có thuộc về user hiện tại không
      if (appointment.user_id != userId) {
        console.log('❌ User not authorized. Appointment user_id:', appointment.user_id, 'Current user_id:', userId);
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền xem lịch hẹn này'
        });
      }

      console.log('✅ Authorization passed');

      // Kiểm tra nếu request là AJAX
      if (req.xhr || req.headers.accept && req.headers.accept.indexOf('json') > -1) {
        console.log('📤 Returning JSON response');
        return res.json({
          success: true,
          appointment
        });
      }

      // Render trang đầy đủ nếu không phải AJAX
      console.log('📤 Rendering full page');
      res.render('appointmentDetail', {
        title: 'Chi tiết lịch hẹn',
        user: req.session.user,
        appointment
      });

    } catch (error) {
      console.error('❌ Error in getAppointmentDetail:', error);
      
      if (req.xhr || req.headers.accept && req.headers.accept.indexOf('json') > -1) {
        return res.status(500).json({
          success: false,
          message: 'Có lỗi xảy ra khi tải chi tiết lịch hẹn'
        });
      }
      
      res.status(500).render('error', {
        message: 'Có lỗi xảy ra khi tải chi tiết lịch hẹn',
        error: error
      });
    }
  }

  // Hủy lịch hẹn
  static async cancelAppointment(req, res) {
    try {
      if (!req.session.user) {
        return res.status(401).json({
          success: false,
          message: 'Vui lòng đăng nhập'
        });
      }

      const { id } = req.params;
      
      // Kiểm tra lịch hẹn thuộc về user
      const appointment = await Appointment.findById(id);
      if (!appointment || appointment.user_id != req.session.user.id) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy lịch hẹn'
        });
      }

      // Kiểm tra trạng thái hiện tại
      if (appointment.status === 'cancelled') {
        return res.status(400).json({
          success: false,
          message: 'Lịch hẹn đã được hủy trước đó'
        });
      }

      if (appointment.status === 'completed') {
        return res.status(400).json({
          success: false,
          message: 'Không thể hủy lịch hẹn đã hoàn thành'
        });
      }

      await Appointment.updateStatus(id, 'cancelled');
      
      res.json({
        success: true,
        message: 'Hủy lịch hẹn thành công!'
      });
    } catch (error) {
      console.error('Error in cancelAppointment:', error);
      res.status(500).json({
        success: false,
        message: 'Có lỗi xảy ra khi hủy lịch hẹn'
      });
    }
  }

  // Đánh giá lịch hẹn
  static async rateAppointment(req, res) {
    try {
      if (!req.session.user) {
        return res.status(401).json({
          success: false,
          message: 'Vui lòng đăng nhập'
        });
      }

      const { id } = req.params;
      const { rating, comment } = req.body;
      
      // Kiểm tra dữ liệu đầu vào
      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: 'Đánh giá phải từ 1-5 sao'
        });
      }

      // Kiểm tra lịch hẹn thuộc về user
      const appointment = await Appointment.findById(id);
      if (!appointment || appointment.user_id != req.session.user.id) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy lịch hẹn'
        });
      }

      // Kiểm tra trạng thái lịch hẹn
      if (appointment.status !== 'completed') {
        return res.status(400).json({
          success: false,
          message: 'Chỉ có thể đánh giá lịch hẹn đã hoàn thành'
        });
      }

      // Lưu đánh giá vào database
      const db = require('../config/db');
      await db.execute(`
        INSERT INTO reviews (user_id, appointment_id, rating, comment, created_at)
        VALUES (?, ?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE rating = ?, comment = ?, updated_at = NOW()
      `, [req.session.user.id, id, rating, comment, rating, comment]);

      res.json({
        success: true,
        message: 'Đánh giá thành công!'
      });
    } catch (error) {
      console.error('Error in rateAppointment:', error);
      res.status(500).json({
        success: false,
        message: 'Có lỗi xảy ra khi đánh giá'
      });
    }
  }

  // Đăng xuất
  static logout(req, res) {
    console.log('🚪 Logging out user...');
    console.log('Session ID:', req.sessionID);
    console.log('Session user:', req.session.user);
    
    req.session.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err);
      }
      console.log('✅ Session destroyed successfully');
      res.redirect('/');
    });
  }

  // Hiển thị trang dịch vụ
  static async getServices(req, res) {
    try {
      console.log('🔧 Rendering services page...');
      console.log('Session user:', req.session.user);
      
      const services = await Service.findAll();
      const categories = await Service.getCategories();
      
      res.render('services', {
        title: 'Dịch vụ',
        user: req.session.user,
        services,
        categories
      });
    } catch (error) {
      console.error('Error in getServices:', error);
      res.status(500).render('error', { 
        message: 'Có lỗi xảy ra khi tải trang dịch vụ',
        error: error 
      });
    }
  }

  // Hiển thị trang stylists
  static async getStylists(req, res) {
    try {
      console.log('💇 Rendering stylists page...');
      console.log('Session user:', req.session.user);
      
      const stylists = await Stylist.findActive();
      
      res.render('stylists', {
        title: 'Đội ngũ stylist',
        user: req.session.user,
        stylists
      });
    } catch (error) {
      console.error('Error in getStylists:', error);
      res.status(500).render('error', { 
        message: 'Có lỗi xảy ra khi tải trang stylists',
        error: error 
      });
    }
  }
}

module.exports = UserController;


