const User = require('../models/userModel');
const Appointment = require('../models/appointmentModel');
const Service = require('../models/serviceModel');
const Stylist = require('../models/stylistModel');
const { validationResult } = require('express-validator');

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
      
      console.log('🎨 Rendering userDashboard...');
      res.render('userDashboard', {
        title: 'Dashboard',
        user: req.session.user,
        appointments
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
      await Appointment.create({
        user_id: req.session.user.id,
        service_id,
        stylist_id,
        appointment_date,
        appointment_time,
        notes
      });

      req.flash('success', 'Đặt lịch hẹn thành công!');
      res.redirect('/dashboard');
    } catch (error) {
      console.error('Error in postBookAppointment:', error);
      res.status(500).render('error', { 
        message: 'Có lỗi xảy ra khi đặt lịch hẹn',
        error: error 
      });
    }
  }

  // Hủy lịch hẹn
  static async cancelAppointment(req, res) {
    try {
      if (!req.session.user) {
        return res.redirect('/login');
      }

      const { id } = req.params;
      
      // Kiểm tra lịch hẹn thuộc về user
      const appointment = await Appointment.findById(id);
      if (!appointment || appointment.user_id != req.session.user.id) {
        req.flash('error', 'Không tìm thấy lịch hẹn');
        return res.redirect('/dashboard');
      }

      await Appointment.updateStatus(id, 'cancelled');
      
      req.flash('success', 'Hủy lịch hẹn thành công!');
      res.redirect('/dashboard');
    } catch (error) {
      console.error('Error in cancelAppointment:', error);
      req.flash('error', 'Có lỗi xảy ra khi hủy lịch hẹn');
      res.redirect('/dashboard');
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


