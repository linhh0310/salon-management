const User = require('../models/userModel');
const Appointment = require('../models/appointmentModel');
const Service = require('../models/serviceModel');
const Stylist = require('../models/stylistModel');
const Category = require('../models/categoryModel');
const Employee = require('../models/employeeModel');
const { validationResult } = require('express-validator');
const db = require('../config/db');

class AdminController {
  // Hiển thị dashboard admin
  static async getDashboard(req, res) {
    try {
      if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/login');
      }

      // Lấy thống kê
      const appointmentStats = await Appointment.getStats();
      const totalUsers = await User.findAll();
      const totalServices = await Service.findAll();
      const totalStylists = await Stylist.findAll();
      const totalCategories = await Category.count();
      const totalProducts = await require('../models/productModel').findAll();
      
      // Thống kê cho salon
      const totalAppointments = await Appointment.findAll();
      const pendingAppointments = totalAppointments.filter(apt => apt.status === 'pending');
      const confirmedAppointments = totalAppointments.filter(apt => apt.status === 'confirmed');
      
      const totalOrders = await require('../models/orderModel').findAll();
      const pendingOrders = totalOrders.filter(order => order.status === 'pending');
      const processedOrders = totalOrders.filter(order => order.status === 'confirmed' || order.status === 'delivered');
      
      const totalReviews = await require('../models/reviewModel').findAll();
      const totalContactMessages = await require('../models/contactModel').findAll();
      const unreadMessages = totalContactMessages.filter(msg => msg.status === 'unread');

      // Lấy lịch hẹn gần đây
      const recentAppointments = await Appointment.findAll();
      const todayAppointments = await Appointment.findByDate(new Date().toISOString().split('T')[0]);

      res.render('adminDashboard', {
        title: 'Admin Dashboard',
        user: req.session.user,
        stats: {
          appointments: appointmentStats,
          users: totalUsers.length,
          services: totalServices.length,
          stylists: totalStylists.length,
          products: totalProducts.length,
          categories: totalCategories,
          totalAppointments: totalAppointments.length,
          pendingAppointments: pendingAppointments.length,
          confirmedAppointments: confirmedAppointments.length,
          pendingOrders: pendingOrders.length,
          processedOrders: processedOrders.length,
          totalReviews: totalReviews.length,
          unreadMessages: unreadMessages.length,
          schedule: 0
        },
        recentAppointments: recentAppointments.slice(0, 10),
        todayAppointments
      });
    } catch (error) {
      console.error('Error in getDashboard:', error);
      res.status(500).render('error', { 
        message: 'Có lỗi xảy ra khi tải dashboard',
        error: error 
      });
    }
  }

  // Quản lý users
  static async getUsers(req, res) {
    try {
      if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/login');
      }

      const users = await User.findAll();
      
      res.render('admin/users', {
        title: 'Quản lý người dùng',
        user: req.session.user,
        currentUser: req.session.user,
        users
      });
    } catch (error) {
      console.error('Error in getUsers:', error);
      res.status(500).render('error', { 
        message: 'Có lỗi xảy ra khi tải danh sách users',
        error: error 
      });
    }
  }

  // Xóa user
  static async deleteUser(req, res) {
    try {
      if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/login');
      }

      const { id } = req.params;
      
      if (id == req.session.user.id) {
        req.flash('error', 'Không thể xóa tài khoản của chính mình');
        return res.redirect('/admin/users');
      }

      await User.delete(id);
      
      req.flash('success', 'Xóa user thành công!');
      res.redirect('/admin/users');
    } catch (error) {
      console.error('Error in deleteUser:', error);
      req.flash('error', 'Có lỗi xảy ra khi xóa user');
      res.redirect('/admin/users');
    }
  }

  // Quản lý appointments
  static async getAppointments(req, res) {
    try {
      if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/login');
      }

      const { status, from_date, to_date, search, page = 1 } = req.query;
      const limit = 10;
      const offset = (page - 1) * limit;

      let appointments = await Appointment.findAll();
      
      // Filter by status
      if (status) {
        appointments = appointments.filter(apt => apt.status === status);
      }
      
      // Filter by date range
      if (from_date) {
        appointments = appointments.filter(apt => apt.appointment_date >= from_date);
      }
      if (to_date) {
        appointments = appointments.filter(apt => apt.appointment_date <= to_date);
      }

      // Search functionality
      if (search) {
        appointments = appointments.filter(apt => 
          apt.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
          apt.service_name?.toLowerCase().includes(search.toLowerCase()) ||
          apt.stylist_name?.toLowerCase().includes(search.toLowerCase()) ||
          apt.notes?.toLowerCase().includes(search.toLowerCase())
        );
      }

      const totalAppointments = appointments.length;
      const totalPages = Math.ceil(totalAppointments / limit);
      const paginatedAppointments = appointments.slice(offset, offset + limit);
      
      // Get statistics
      const stats = await Appointment.getStats();
      
      res.render('admin/appointments', {
        title: 'Quản lý lịch hẹn',
        user: req.session.user,
        appointments: paginatedAppointments,
        currentPage: parseInt(page),
        totalPages,
        status,
        from_date,
        to_date,
        search,
        stats
      });
    } catch (error) {
      console.error('Error in getAppointments:', error);
      res.status(500).render('error', { 
        message: 'Có lỗi xảy ra khi tải danh sách lịch hẹn',
        error: error 
      });
    }
  }

  // Cập nhật trạng thái appointment
  static async updateAppointmentStatus(req, res) {
    try {
      if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/login');
      }

      const { id } = req.params;
      const { status } = req.body;

      await Appointment.updateStatus(id, status);
      
      req.flash('success', 'Cập nhật trạng thái thành công!');
      res.redirect('/admin/appointments');
    } catch (error) {
      console.error('Error in updateAppointmentStatus:', error);
      req.flash('error', 'Có lỗi xảy ra khi cập nhật trạng thái');
      res.redirect('/admin/appointments');
    }
  }

  // Hiển thị form thêm lịch hẹn
  static async getAddAppointment(req, res) {
    try {
      if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/login');
      }

      const services = await Service.findAll();
      const stylists = await Stylist.findActive();
      const users = await User.findAll();
      
      res.render('admin/appointments/add', {
        title: 'Thêm lịch hẹn mới',
        user: req.session.user,
        services,
        stylists,
        users
      });
    } catch (error) {
      console.error('Error in getAddAppointment:', error);
      res.status(500).render('error', { 
        message: 'Có lỗi xảy ra khi tải form thêm lịch hẹn',
        error: error 
      });
    }
  }

  // Xử lý thêm lịch hẹn
  static async postAddAppointment(req, res) {
    try {
      if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/login');
      }

      const { user_id, service_id, stylist_id, appointment_date, appointment_time, notes, status } = req.body;

      // Validate required fields
      if (!user_id || !service_id || !stylist_id || !appointment_date || !appointment_time) {
        req.flash('error', 'Vui lòng điền đầy đủ thông tin bắt buộc');
        return res.redirect('/admin/appointments/add');
      }

      // Check stylist availability
      const isAvailable = await Appointment.checkStylistAvailability(stylist_id, appointment_date, appointment_time);
      if (!isAvailable) {
        req.flash('error', 'Stylist đã có lịch hẹn vào thời gian này');
        return res.redirect('/admin/appointments/add');
      }

      // Create appointment
      await Appointment.create({
        user_id,
        service_id,
        stylist_id,
        appointment_date,
        appointment_time,
        notes: notes || '',
        status: status || 'pending'
      });

      req.flash('success', 'Thêm lịch hẹn thành công!');
      res.redirect('/admin/appointments');
    } catch (error) {
      console.error('Error in postAddAppointment:', error);
      req.flash('error', 'Có lỗi xảy ra khi thêm lịch hẹn');
      res.redirect('/admin/appointments/add');
    }
  }

  // Hiển thị form sửa lịch hẹn
  static async getEditAppointment(req, res) {
    try {
      if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/login');
      }

      const { id } = req.params;
      const appointment = await Appointment.findById(id);
      
      if (!appointment) {
        req.flash('error', 'Không tìm thấy lịch hẹn');
        return res.redirect('/admin/appointments');
      }

      const services = await Service.findAll();
      const stylists = await Stylist.findActive();
      const users = await User.findAll();
      
      res.render('admin/appointments/edit', {
        title: 'Sửa lịch hẹn',
        user: req.session.user,
        appointment,
        services,
        stylists,
        users
      });
    } catch (error) {
      console.error('Error in getEditAppointment:', error);
      res.status(500).render('error', { 
        message: 'Có lỗi xảy ra khi tải form sửa lịch hẹn',
        error: error 
      });
    }
  }

  // Xử lý sửa lịch hẹn
  static async postEditAppointment(req, res) {
    try {
      if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/login');
      }

      const { id } = req.params;
      const { user_id, service_id, stylist_id, appointment_date, appointment_time, notes, status } = req.body;

      // Validate required fields
      if (!user_id || !service_id || !stylist_id || !appointment_date || !appointment_time) {
        req.flash('error', 'Vui lòng điền đầy đủ thông tin bắt buộc');
        return res.redirect(`/admin/appointments/edit/${id}`);
      }

      // Check if appointment exists
      const existingAppointment = await Appointment.findById(id);
      if (!existingAppointment) {
        req.flash('error', 'Không tìm thấy lịch hẹn');
        return res.redirect('/admin/appointments');
      }

      // Check stylist availability (exclude current appointment)
      const isAvailable = await Appointment.checkStylistAvailability(stylist_id, appointment_date, appointment_time);
      if (!isAvailable && (stylist_id != existingAppointment.stylist_id || 
          appointment_date != existingAppointment.appointment_date || 
          appointment_time != existingAppointment.appointment_time)) {
        req.flash('error', 'Stylist đã có lịch hẹn vào thời gian này');
        return res.redirect(`/admin/appointments/edit/${id}`);
      }

      // Update appointment
      await Appointment.update(id, {
        user_id,
        service_id,
        stylist_id,
        appointment_date,
        appointment_time,
        notes: notes || '',
        status: status || 'pending'
      });

      req.flash('success', 'Cập nhật lịch hẹn thành công!');
      res.redirect('/admin/appointments');
    } catch (error) {
      console.error('Error in postEditAppointment:', error);
      req.flash('error', 'Có lỗi xảy ra khi cập nhật lịch hẹn');
      res.redirect(`/admin/appointments/edit/${req.params.id}`);
    }
  }

  // Xóa appointment
  static async deleteAppointment(req, res) {
    try {
      if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/login');
      }

      const { id } = req.params;
      
      const appointment = await Appointment.findById(id);
      if (!appointment) {
        req.flash('error', 'Không tìm thấy lịch hẹn');
        return res.redirect('/admin/appointments');
      }
      
      await Appointment.delete(id);
      
      req.flash('success', 'Xóa lịch hẹn thành công!');
      res.redirect('/admin/appointments');
    } catch (error) {
      console.error('Error in deleteAppointment:', error);
      req.flash('error', 'Có lỗi xảy ra khi xóa lịch hẹn');
      res.redirect('/admin/appointments');
    }
  }

  // Quản lý services
  static async getServices(req, res) {
    try {
      if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/login');
      }

      const { status, search, category_id, page = 1 } = req.query;
      const limit = 10;
      const offset = (page - 1) * limit;

      let services = await Service.findAll();
      const categories = await Category.findAll();

      // Lọc theo trạng thái
      if (status) {
        if (status === 'active') {
          services = services.filter(service => service.is_active === 1);
        } else if (status === 'inactive') {
          services = services.filter(service => service.is_active === 0);
        }
      }

      // Lọc theo danh mục
      if (category_id) {
        services = services.filter(service => service.category_id == category_id);
      }

      // Tìm kiếm
      if (search) {
        services = services.filter(service =>
          service.name?.toLowerCase().includes(search.toLowerCase()) ||
          service.description?.toLowerCase().includes(search.toLowerCase())
        );
      }

      // Tính toán thống kê
      const stats = {
        total: services.length,
        active: services.filter(s => s.is_active === 1).length,
        inactive: services.filter(s => s.is_active === 0).length
      };

      // Phân trang
      const totalPages = Math.ceil(services.length / limit);
      const currentPage = parseInt(page);
      const paginatedServices = services.slice(offset, offset + limit);

      res.render('admin/services', {
        title: 'Quản lý dịch vụ',
        user: req.session.user,
        services: paginatedServices,
        categories,
        stats,
        currentPage,
        totalPages,
        status,
        search,
        category_id
      });
    } catch (error) {
      console.error('Error in getServices:', error);
      res.status(500).render('error', { 
        message: 'Có lỗi xảy ra khi tải danh sách dịch vụ',
        error: error 
      });
    }
  }

  // Hiển thị form thêm service
  static async getAddService(req, res) {
    try {
      if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/login');
      }

      const categories = await Category.findAll();

      res.render('admin/services/add', {
        title: 'Thêm dịch vụ mới',
        user: req.session.user,
        categories
      });
    } catch (error) {
      console.error('Error in getAddService:', error);
      req.flash('error', 'Có lỗi xảy ra khi tải form thêm dịch vụ');
      res.redirect('/admin/services');
    }
  }

  // Xử lý thêm service
  static async postAddService(req, res) {
    try {
      console.log('🔍 Bắt đầu xử lý thêm dịch vụ...');
      console.log('📝 Request body:', req.body);
      
      if (!req.session.user || req.session.user.role !== 'admin') {
        console.log('❌ Không phải admin, redirect to login');
        return res.redirect('/login');
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log('❌ Validation errors:', errors.array());
        const categories = await Category.findAll();
        return res.render('admin/services/add', {
          title: 'Thêm dịch vụ mới',
          user: req.session.user,
          categories,
          errors: errors.array(),
          ...req.body // Giữ lại dữ liệu đã nhập
        });
      }

      const { name, description, price, duration, category_id, is_active } = req.body;
      console.log('📋 Dữ liệu đã parse:', { name, description, price, duration, category_id, is_active });
      
      const serviceData = { 
        name, 
        description, 
        price, 
        duration, 
        category_id: category_id || null,
        is_active: is_active === 'true' ? 1 : (is_active === 'false' ? 0 : 1)
      };
      console.log('📦 Dữ liệu gửi đến Service.create:', serviceData);
      
      const newServiceId = await Service.create(serviceData);
      console.log('✅ Thêm dịch vụ thành công, ID:', newServiceId);
      
      req.flash('success', 'Thêm dịch vụ thành công!');
      res.redirect('/admin/services');
    } catch (error) {
      console.error('❌ Error in postAddService:', error);
      console.error('📋 Error details:', error.message);
      const categories = await Category.findAll();
      res.render('admin/services/add', {
        title: 'Thêm dịch vụ mới',
        user: req.session.user,
        categories,
        errors: [{ msg: 'Có lỗi xảy ra khi thêm dịch vụ: ' + error.message }],
        ...req.body // Giữ lại dữ liệu đã nhập
      });
    }
  }

  // Hiển thị form edit service
  static async getEditService(req, res) {
    try {
      if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/login');
      }

      const { id } = req.params;
      const service = await Service.findById(id);
      const categories = await Category.findAll();
      
      if (!service) {
        req.flash('error', 'Không tìm thấy dịch vụ');
        return res.redirect('/admin/services');
      }

      res.render('admin/services/edit', {
        title: 'Chỉnh sửa dịch vụ',
        user: req.session.user,
        service,
        categories
      });
    } catch (error) {
      console.error('Error in getEditService:', error);
      req.flash('error', 'Có lỗi xảy ra khi tải thông tin dịch vụ');
      res.redirect('/admin/services');
    }
  }

  // Xử lý edit service
  static async postEditService(req, res) {
    try {
      if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/login');
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const { id } = req.params;
        const service = await Service.findById(id);
        const categories = await Category.findAll();
        
        return res.render('admin/services/edit', {
          title: 'Chỉnh sửa dịch vụ',
          user: req.session.user,
          service,
          categories,
          errors: errors.array()
        });
      }

      const { id } = req.params;
      const { name, description, price, duration, category_id, is_active } = req.body;
      
      await Service.update(id, { 
        name, 
        description, 
        price, 
        duration, 
        category_id: category_id || null,
        is_active: is_active === 'true' ? 1 : (is_active === 'false' ? 0 : 1)
      });
      
      req.flash('success', 'Cập nhật dịch vụ thành công!');
      res.redirect('/admin/services');
    } catch (error) {
      console.error('Error in postEditService:', error);
      req.flash('error', 'Có lỗi xảy ra khi cập nhật dịch vụ');
      res.redirect('/admin/services');
    }
  }

  // Xóa service
  static async deleteService(req, res) {
    try {
      if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/login');
      }

      const { id } = req.params;
      
      await Service.delete(id);
      
      req.flash('success', 'Xóa dịch vụ thành công!');
      res.redirect('/admin/services');
    } catch (error) {
      console.error('Error in deleteService:', error);
      req.flash('error', 'Có lỗi xảy ra khi xóa dịch vụ');
      res.redirect('/admin/services');
    }
  }

  // Quản lý stylists
  static async getStylists(req, res) {
    try {
      if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/login');
      }

      const { status, search, page = 1 } = req.query;
      const limit = 10;
      const offset = (page - 1) * limit;

      let stylists = await Stylist.findAll();
      
      // Lọc theo trạng thái
      if (status) {
        if (status === 'active') {
          stylists = stylists.filter(stylist => stylist.is_active === 1);
        } else if (status === 'inactive') {
          stylists = stylists.filter(stylist => stylist.is_active === 0);
        }
      }

      // Tìm kiếm
      if (search) {
        stylists = stylists.filter(stylist =>
          stylist.name?.toLowerCase().includes(search.toLowerCase()) ||
          stylist.email?.toLowerCase().includes(search.toLowerCase()) ||
          stylist.phone?.includes(search) ||
          stylist.specialization?.toLowerCase().includes(search.toLowerCase())
        );
      }

      // Tính toán thống kê
      const stats = {
        total: stylists.length,
        active: stylists.filter(s => s.is_active === 1).length,
        inactive: stylists.filter(s => s.is_active === 0).length
      };

      // Phân trang
      const totalPages = Math.ceil(stylists.length / limit);
      const currentPage = parseInt(page);
      const paginatedStylists = stylists.slice(offset, offset + limit);
      
      res.render('admin/stylists', {
        title: 'Quản lý stylist',
        user: req.session.user,
        stylists: paginatedStylists,
        stats,
        currentPage,
        totalPages,
        status,
        search
      });
    } catch (error) {
      console.error('Error in getStylists:', error);
      res.status(500).render('error', { 
        message: 'Có lỗi xảy ra khi tải danh sách stylist',
        error: error 
      });
    }
  }

  // Hiển thị form thêm stylist
  static async getAddStylist(req, res) {
    try {
      if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/login');
      }

      res.render('admin/stylists/add', {
        title: 'Thêm stylist mới',
        user: req.session.user
      });
    } catch (error) {
      console.error('Error in getAddStylist:', error);
      req.flash('error', 'Có lỗi xảy ra khi tải form thêm stylist');
      res.redirect('/admin/stylists');
    }
  }

  // Xử lý thêm stylist
  static async postAddStylist(req, res) {
    try {
      if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/login');
      }

      const { name, email, phone, specialization, experience, status, bio } = req.body;

      // Validation
      if (!name || !email || !phone) {
        req.flash('error', 'Vui lòng điền đầy đủ thông tin bắt buộc');
        return res.redirect('/admin/stylists/add');
      }

      // Kiểm tra email đã tồn tại
      const existingStylist = await Stylist.findByEmail(email);
      if (existingStylist) {
        req.flash('error', 'Email đã được sử dụng bởi stylist khác');
        return res.redirect('/admin/stylists/add');
      }

      await Stylist.create({ 
        name, 
        email, 
        phone, 
        specialization: specialization || '', 
        experience: experience || 0, 
        status: status || 'active',
        bio: bio || ''
      });
      
      req.flash('success', 'Thêm stylist thành công!');
      res.redirect('/admin/stylists');
    } catch (error) {
      console.error('Error in postAddStylist:', error);
      req.flash('error', 'Có lỗi xảy ra khi thêm stylist');
      res.redirect('/admin/stylists/add');
    }
  }

  // Hiển thị form edit stylist
  static async getEditStylist(req, res) {
    try {
      if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/login');
      }

      const { id } = req.params;
      const stylist = await Stylist.findById(id);
      
      if (!stylist) {
        req.flash('error', 'Không tìm thấy stylist');
        return res.redirect('/admin/stylists');
      }

      res.render('admin/stylists/edit', {
        title: 'Sửa stylist',
        user: req.session.user,
        stylist
      });
    } catch (error) {
      console.error('Error in getEditStylist:', error);
      req.flash('error', 'Có lỗi xảy ra khi tải thông tin stylist');
      res.redirect('/admin/stylists');
    }
  }

  // Xử lý edit stylist
  static async postEditStylist(req, res) {
    try {
      if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/login');
      }

      const { id } = req.params;
      const { name, email, phone, specialization, experience, status, bio } = req.body;

      // Validation
      if (!name || !email || !phone) {
        req.flash('error', 'Vui lòng điền đầy đủ thông tin bắt buộc');
        return res.redirect(`/admin/stylists/${id}/edit`);
      }

      // Kiểm tra stylist tồn tại
      const existingStylist = await Stylist.findById(id);
      if (!existingStylist) {
        req.flash('error', 'Không tìm thấy stylist');
        return res.redirect('/admin/stylists');
      }

      // Kiểm tra email đã tồn tại (trừ stylist hiện tại)
      const stylistWithEmail = await Stylist.findByEmail(email);
      if (stylistWithEmail && stylistWithEmail.id != id) {
        req.flash('error', 'Email đã được sử dụng bởi stylist khác');
        return res.redirect(`/admin/stylists/${id}/edit`);
      }

      await Stylist.update(id, { 
        name, 
        email, 
        phone, 
        specialization: specialization || '', 
        experience: experience || 0, 
        status: status || 'active',
        bio: bio || ''
      });
      
      req.flash('success', 'Cập nhật stylist thành công!');
      res.redirect('/admin/stylists');
    } catch (error) {
      console.error('Error in postEditStylist:', error);
      req.flash('error', 'Có lỗi xảy ra khi cập nhật stylist');
      res.redirect('/admin/stylists');
    }
  }

  // Xóa stylist
  static async deleteStylist(req, res) {
    try {
      if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/login');
      }

      const { id } = req.params;
      
      await Stylist.delete(id);
      
      req.flash('success', 'Xóa stylist thành công!');
      res.redirect('/admin/stylists');
    } catch (error) {
      console.error('Error in deleteStylist:', error);
      req.flash('error', 'Có lỗi xảy ra khi xóa stylist');
      res.redirect('/admin/stylists');
    }
  }

  // Quản lý products
  static async getProducts(req, res) {
    try {
      if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/login');
      }

      const { status, search, category_id, page = 1 } = req.query;
      const limit = 10;
      const offset = (page - 1) * limit;

      const Product = require('../models/productModel');
      let products = await Product.findAll();
      const categories = await Category.findAll();

      // Lọc theo trạng thái
      if (status) {
        if (status === 'active') {
          products = products.filter(product => product.is_active === 1);
        } else if (status === 'inactive') {
          products = products.filter(product => product.is_active === 0);
        }
      }

      // Lọc theo danh mục
      if (category_id) {
        products = products.filter(product => product.category_id == category_id);
      }

      // Tìm kiếm
      if (search) {
        products = products.filter(product =>
          product.name?.toLowerCase().includes(search.toLowerCase()) ||
          product.description?.toLowerCase().includes(search.toLowerCase())
        );
      }

      // Tính toán thống kê
      const stats = {
        total: products.length,
        active: products.filter(p => p.is_active === 1).length,
        inactive: products.filter(p => p.is_active === 0).length,
        lowStock: products.filter(p => p.quantity < 10).length
      };

      // Phân trang
      const totalPages = Math.ceil(products.length / limit);
      const currentPage = parseInt(page);
      const paginatedProducts = products.slice(offset, offset + limit);
      
      res.render('admin/products', {
        title: 'Quản lý Sản phẩm',
        user: req.session.user,
        products: paginatedProducts,
        categories,
        stats,
        currentPage,
        totalPages,
        status,
        search,
        category_id
      });
    } catch (error) {
      console.error('Error in getProducts:', error);
      res.status(500).render('error', { 
        message: 'Có lỗi xảy ra khi tải danh sách sản phẩm',
        error: error 
      });
    }
  }

  // Hiển thị form thêm sản phẩm
  static async getAddProduct(req, res) {
    try {
      if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/login');
      }

      const categories = await Category.findAll();

      res.render('admin/products/add', {
        title: 'Thêm Sản phẩm',
        user: req.session.user,
        categories
      });
    } catch (error) {
      console.error('Error in getAddProduct:', error);
      req.flash('error', 'Có lỗi xảy ra khi tải form thêm sản phẩm');
      res.redirect('/admin/products');
    }
  }

  // Xử lý thêm sản phẩm
  static async postAddProduct(req, res) {
    try {
      if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/login');
      }

      const { name, description, price, quantity, category_id, features, is_active } = req.body;
      
      // Xử lý upload ảnh
      let imageUrl = null;
      if (req.file) {
        imageUrl = `/uploads/products/${req.file.filename}`;
      }

      const Product = require('../models/productModel');
      await Product.create({
        name,
        description,
        price: parseFloat(price),
        quantity: parseInt(quantity),
        category_id: category_id || null,
        image_url: imageUrl,
        features: features ? JSON.stringify(features.split(',').map(f => f.trim())) : null,
        is_active: is_active === 'true' ? 1 : (is_active === 'false' ? 0 : 1)
      });

      req.flash('success', 'Thêm sản phẩm thành công!');
      res.redirect('/admin/products');
    } catch (error) {
      console.error('Error in postAddProduct:', error);
      req.flash('error', 'Có lỗi xảy ra khi thêm sản phẩm');
      res.redirect('/admin/products/add');
    }
  }

  // Hiển thị form sửa sản phẩm
  static async getEditProduct(req, res) {
    try {
      if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/login');
      }

      const { id } = req.params;
      const Product = require('../models/productModel');
      const product = await Product.findById(id);
      const categories = await Category.findAll();

      if (!product) {
        req.flash('error', 'Không tìm thấy sản phẩm!');
        return res.redirect('/admin/products');
      }

      res.render('admin/products/edit', {
        title: 'Sửa Sản phẩm',
        user: req.session.user,
        product,
        categories
      });
    } catch (error) {
      console.error('Error in getEditProduct:', error);
      req.flash('error', 'Có lỗi xảy ra khi tải form sửa sản phẩm');
      res.redirect('/admin/products');
    }
  }

  // Xử lý sửa sản phẩm
  static async postEditProduct(req, res) {
    try {
      if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/login');
      }

      const { id } = req.params;
      const { name, description, price, quantity, category_id, features, is_active } = req.body;
      
      // Xử lý upload ảnh
      let imageUrl = req.body.current_image;
      if (req.file) {
        imageUrl = `/uploads/products/${req.file.filename}`;
      }

      const Product = require('../models/productModel');
      const success = await Product.update(id, {
        name,
        description,
        price: parseFloat(price),
        quantity: parseInt(quantity),
        category_id: category_id || null,
        image_url: imageUrl,
        features: features ? JSON.stringify(features.split(',').map(f => f.trim())) : null,
        is_active: is_active === 'true' ? 1 : (is_active === 'false' ? 0 : 1)
      });

      if (success) {
        req.flash('success', 'Cập nhật sản phẩm thành công!');
      } else {
        req.flash('error', 'Không thể cập nhật sản phẩm!');
      }
      
      res.redirect('/admin/products');
    } catch (error) {
      console.error('Error in postEditProduct:', error);
      req.flash('error', 'Có lỗi xảy ra khi cập nhật sản phẩm');
      res.redirect(`/admin/products/${req.params.id}/edit`);
    }
  }

  // Xóa sản phẩm
  static async deleteProduct(req, res) {
    try {
      if (!req.session.user || req.session.user.role !== 'admin') {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { id } = req.params;
      const Product = require('../models/productModel');
      const success = await Product.delete(id);

      if (success) {
        res.json({ success: true, message: 'Xóa sản phẩm thành công!' });
      } else {
        res.json({ success: false, message: 'Không thể xóa sản phẩm!' });
      }
    } catch (error) {
      console.error('Error in deleteProduct:', error);
      res.status(500).json({ success: false, message: 'Có lỗi xảy ra khi xóa sản phẩm' });
    }
  }

  // ==================== EMPLOYEE MANAGEMENT ====================
  
  // Hiển thị danh sách employees
  static async getEmployees(req, res) {
    try {
      if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/login');
      }

      const employees = await Employee.findAll();
      
      res.render('admin/employees', {
        title: 'Quản lý Nhân viên',
        user: req.session.user,
        employees
      });
    } catch (error) {
      console.error('Error in getEmployees:', error);
      res.status(500).render('error', { 
        message: 'Có lỗi xảy ra khi tải danh sách nhân viên',
        error: error 
      });
    }
  }

  // Hiển thị form thêm employee
  static getAddEmployee(req, res) {
    try {
      if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/login');
      }

      res.render('admin/employees/add', {
        title: 'Thêm Nhân viên',
        user: req.session.user
      });
    } catch (error) {
      console.error('Error in getAddEmployee:', error);
      req.flash('error', 'Có lỗi xảy ra khi tải form thêm nhân viên');
      res.redirect('/admin/employees');
    }
  }

  // Xử lý thêm employee
  static async postAddEmployee(req, res) {
    try {
      if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/login');
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.render('admin/employees/add', {
          title: 'Thêm Nhân viên',
          user: req.session.user,
          errors: errors.array()
        });
      }

      // Xử lý upload ảnh
      let photoPath = null;
      if (req.file) {
        photoPath = `/uploads/employees/${req.file.filename}`;
      }

      // Kiểm tra employee_id đã tồn tại chưa
      const existingEmployee = await Employee.findByEmployeeId(req.body.employee_id);
      if (existingEmployee) {
        req.flash('error', 'Mã nhân viên đã tồn tại!');
        return res.redirect('/admin/employees/add');
      }

      // Tạo employee mới
      const employeeData = {
        ...req.body,
        photo: photoPath
      };

      await Employee.create(employeeData);
      
      req.flash('success', 'Thêm nhân viên thành công!');
      res.redirect('/admin/employees');
    } catch (error) {
      console.error('Error in postAddEmployee:', error);
      req.flash('error', 'Có lỗi xảy ra khi thêm nhân viên');
      res.redirect('/admin/employees');
    }
  }

  // Hiển thị chi tiết employee
  static async getViewEmployee(req, res) {
    try {
      if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/login');
      }

      const { id } = req.params;
      
      const employee = await Employee.findById(id);
      if (!employee) {
        req.flash('error', 'Không tìm thấy nhân viên');
        return res.redirect('/admin/employees');
      }

      res.render('admin/employees/view', {
        title: 'Chi tiết Nhân viên',
        user: req.session.user,
        employee
      });
    } catch (error) {
      console.error('Error in getViewEmployee:', error);
      req.flash('error', 'Có lỗi xảy ra khi tải thông tin nhân viên');
      res.redirect('/admin/employees');
    }
  }

  // Hiển thị form edit employee
  static async getEditEmployee(req, res) {
    try {
      if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/login');
      }

      const { id } = req.params;
      
      const employee = await Employee.findById(id);
      if (!employee) {
        req.flash('error', 'Không tìm thấy nhân viên');
        return res.redirect('/admin/employees');
      }

      res.render('admin/employees/edit', {
        title: 'Chỉnh sửa Nhân viên',
        user: req.session.user,
        employee
      });
    } catch (error) {
      console.error('Error in getEditEmployee:', error);
      req.flash('error', 'Có lỗi xảy ra khi tải thông tin nhân viên');
      res.redirect('/admin/employees');
    }
  }

  // Xử lý edit employee
  static async postEditEmployee(req, res) {
    try {
      if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/login');
      }

      const { id } = req.params;
      
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const employee = await Employee.findById(id);
        return res.render('admin/employees/edit', {
          title: 'Chỉnh sửa Nhân viên',
          user: req.session.user,
          employee,
          errors: errors.array()
        });
      }

      // Xử lý upload ảnh
      let photoPath = null;
      if (req.file) {
        photoPath = `/uploads/employees/${req.file.filename}`;
      }

      // Cập nhật employee
      const employeeData = {
        ...req.body,
        photo: photoPath
      };

      await Employee.update(id, employeeData);
      
      req.flash('success', 'Cập nhật nhân viên thành công!');
      res.redirect('/admin/employees');
    } catch (error) {
      console.error('Error in postEditEmployee:', error);
      req.flash('error', 'Có lỗi xảy ra khi cập nhật nhân viên');
      res.redirect('/admin/employees');
    }
  }

  // Xóa employee
  static async deleteEmployee(req, res) {
    try {
      if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/login');
      }

      const { id } = req.params;
      
      const deleted = await Employee.delete(id);
      if (!deleted) {
        return res.json({ success: false, message: 'Không tìm thấy nhân viên để xóa' });
      }
      
      res.json({ success: true, message: 'Xóa nhân viên thành công!' });
    } catch (error) {
      console.error('Error in deleteEmployee:', error);
      res.json({ success: false, message: 'Có lỗi xảy ra khi xóa nhân viên' });
    }
  }

  // ==================== OTHER MANAGEMENT METHODS ====================
  
  // Orders management
  static async getOrders(req, res) {
    try {
      if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/login');
      }

      const Order = require('../models/orderModel');
      
      // Get query parameters
      const { search, status, from_date, to_date, page = 1 } = req.query;
      const limit = 10;
      const offset = (page - 1) * limit;

      // Build query conditions
      let whereConditions = [];
      let queryParams = [];

      if (search) {
        whereConditions.push(`(o.id LIKE ? OR c.name LIKE ? OR c.email LIKE ?)`);
        queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }

      if (status) {
        whereConditions.push(`o.status = ?`);
        queryParams.push(status);
      }

      if (from_date) {
        whereConditions.push(`DATE(o.created_at) >= ?`);
        queryParams.push(from_date);
      }

      if (to_date) {
        whereConditions.push(`DATE(o.created_at) <= ?`);
        queryParams.push(to_date);
      }

      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      // Get total count
      const [countResult] = await db.execute(`
        SELECT COUNT(*) as total
        FROM orders o
        LEFT JOIN customers c ON o.customer_id = c.id
        ${whereClause}
      `, queryParams);

      const totalOrders = countResult[0].total;
      const totalPages = Math.ceil(totalOrders / limit);

      // Get orders with pagination
      const [orders] = await db.execute(`
        SELECT o.*, c.name as customer_name,
               (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as total_items
        FROM orders o
        LEFT JOIN customers c ON o.customer_id = c.id
        ${whereClause}
        ORDER BY o.created_at DESC
        LIMIT ? OFFSET ?
      `, [...queryParams, limit, offset]);

      // Get statistics
      const [statsResult] = await db.execute(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
          SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed,
          SUM(CASE WHEN status = 'shipped' THEN 1 ELSE 0 END) as shipped,
          SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered,
          SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled
        FROM orders
      `);

      const stats = statsResult[0];

      // Build query string for pagination
      const queryParamsForPagination = new URLSearchParams();
      if (search) queryParamsForPagination.append('search', search);
      if (status) queryParamsForPagination.append('status', status);
      if (from_date) queryParamsForPagination.append('from_date', from_date);
      if (to_date) queryParamsForPagination.append('to_date', to_date);
      const queryString = queryParamsForPagination.toString() ? `&${queryParamsForPagination.toString()}` : '';
      
      res.render('admin/orders', {
        title: 'Quản lý Đơn hàng',
        user: req.session.user,
        orders,
        stats,
        search,
        status,
        from_date,
        to_date,
        currentPage: parseInt(page),
        totalPages,
        queryString
      });
    } catch (error) {
      console.error('Error in getOrders:', error);
      res.status(500).render('error', { 
        message: 'Có lỗi xảy ra khi tải danh sách đơn hàng',
        error: error 
      });
    }
  }

  // Hiển thị chi tiết đơn hàng
  static async getViewOrder(req, res) {
    try {
      if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/login');
      }

      const { id } = req.params;
      const Order = require('../models/orderModel');
      const order = await Order.findById(id);

      if (!order) {
        req.flash('error', 'Không tìm thấy đơn hàng!');
        return res.redirect('/admin/orders');
      }

      // Lấy chi tiết sản phẩm trong đơn hàng
      const [orderItems] = await db.execute(`
        SELECT oi.*, p.name as product_name, p.image_url as product_image
        FROM order_items oi
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
      `, [id]);

      res.render('admin/orders/view', {
        title: 'Chi tiết đơn hàng',
        user: req.session.user,
        order,
        orderItems
      });
    } catch (error) {
      console.error('Error in getViewOrder:', error);
      req.flash('error', 'Có lỗi xảy ra khi tải chi tiết đơn hàng');
      res.redirect('/admin/orders');
    }
  }

  // Cập nhật trạng thái đơn hàng
  static async updateOrderStatus(req, res) {
    try {
      if (!req.session.user || req.session.user.role !== 'admin') {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { id } = req.params;
      const { status } = req.body;
      
      const Order = require('../models/orderModel');
      const success = await Order.updateStatus(id, status);

      if (success) {
        res.json({ success: true, message: 'Cập nhật trạng thái thành công!' });
      } else {
        res.json({ success: false, message: 'Không thể cập nhật trạng thái!' });
      }
    } catch (error) {
      console.error('Error in updateOrderStatus:', error);
      res.status(500).json({ success: false, message: 'Có lỗi xảy ra khi cập nhật trạng thái' });
    }
  }

  // Xóa đơn hàng
  static async deleteOrder(req, res) {
    try {
      if (!req.session.user || req.session.user.role !== 'admin') {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { id } = req.params;
      
      // Xóa order_items trước
      await db.execute('DELETE FROM order_items WHERE order_id = ?', [id]);
      
      // Sau đó xóa order
      const [result] = await db.execute('DELETE FROM orders WHERE id = ?', [id]);

      if (result.affectedRows > 0) {
        res.json({ success: true, message: 'Xóa đơn hàng thành công!' });
      } else {
        res.json({ success: false, message: 'Không thể xóa đơn hàng!' });
      }
    } catch (error) {
      console.error('Error in deleteOrder:', error);
      res.status(500).json({ success: false, message: 'Có lỗi xảy ra khi xóa đơn hàng' });
    }
  }

  // Hiển thị form thêm đơn hàng
  static async getAddOrder(req, res) {
    try {
      if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/login');
      }

      // Lấy danh sách khách hàng và sản phẩm
      const [customers] = await db.execute('SELECT id, name, email FROM customers ORDER BY name');
      const [products] = await db.execute('SELECT id, name, price, quantity FROM products WHERE is_active = 1 ORDER BY name');

      res.render('admin/orders/add', {
        title: 'Thêm đơn hàng mới',
        user: req.session.user,
        customers,
        products
      });
    } catch (error) {
      console.error('Error in getAddOrder:', error);
      req.flash('error', 'Có lỗi xảy ra khi tải form thêm đơn hàng');
      res.redirect('/admin/orders');
    }
  }

  // Xử lý thêm đơn hàng
  static async postAddOrder(req, res) {
    try {
      if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/login');
      }

      const { customer_id, products, total_amount, status, notes } = req.body;

      // Validate required fields
      if (!customer_id || !products || !total_amount) {
        req.flash('error', 'Vui lòng điền đầy đủ thông tin bắt buộc');
        return res.redirect('/admin/orders/add');
      }

      // Tạo đơn hàng mới
      const [orderResult] = await db.execute(`
        INSERT INTO orders (customer_id, total_amount, status, notes, created_at, updated_at)
        VALUES (?, ?, ?, ?, NOW(), NOW())
      `, [customer_id, total_amount, status || 'pending', notes || null]);

      const orderId = orderResult.insertId;

      // Thêm các sản phẩm vào đơn hàng
      const productArray = JSON.parse(products);
      for (const product of productArray) {
        await db.execute(`
          INSERT INTO order_items (order_id, product_id, quantity, price)
          VALUES (?, ?, ?, ?)
        `, [orderId, product.id, product.quantity, product.price]);

        // Cập nhật số lượng sản phẩm
        await db.execute(`
          UPDATE products 
          SET quantity = quantity - ? 
          WHERE id = ?
        `, [product.quantity, product.id]);
      }

      req.flash('success', 'Thêm đơn hàng thành công!');
      res.redirect('/admin/orders');
    } catch (error) {
      console.error('Error in postAddOrder:', error);
      req.flash('error', 'Có lỗi xảy ra khi thêm đơn hàng');
      res.redirect('/admin/orders/add');
    }
  }

  // Hiển thị form sửa đơn hàng
  static async getEditOrder(req, res) {
    try {
      if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/login');
      }

      const { id } = req.params;

      // Lấy thông tin đơn hàng
      const [orders] = await db.execute(`
        SELECT o.*, c.name as customer_name, c.email as customer_email
        FROM orders o
        LEFT JOIN customers c ON o.customer_id = c.id
        WHERE o.id = ?
      `, [id]);

      if (orders.length === 0) {
        req.flash('error', 'Không tìm thấy đơn hàng!');
        return res.redirect('/admin/orders');
      }

      const order = orders[0];

      // Lấy chi tiết sản phẩm trong đơn hàng
      const [orderItems] = await db.execute(`
        SELECT oi.*, p.name as product_name, p.price as product_price
        FROM order_items oi
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
      `, [id]);

      // Lấy danh sách khách hàng và sản phẩm
      const [customers] = await db.execute('SELECT id, name, email FROM customers ORDER BY name');
      const [products] = await db.execute('SELECT id, name, price, quantity FROM products WHERE is_active = 1 ORDER BY name');

      res.render('admin/orders/edit', {
        title: 'Sửa đơn hàng',
        user: req.session.user,
        order,
        orderItems,
        customers,
        products
      });
    } catch (error) {
      console.error('Error in getEditOrder:', error);
      req.flash('error', 'Có lỗi xảy ra khi tải form sửa đơn hàng');
      res.redirect('/admin/orders');
    }
  }

  // Xử lý sửa đơn hàng
  static async postEditOrder(req, res) {
    try {
      if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/login');
      }

      const { id } = req.params;
      const { customer_id, total_amount, status, notes } = req.body;

      // Validate required fields
      if (!customer_id || !total_amount) {
        req.flash('error', 'Vui lòng điền đầy đủ thông tin bắt buộc');
        return res.redirect(`/admin/orders/${id}/edit`);
      }

      // Cập nhật đơn hàng
      await db.execute(`
        UPDATE orders 
        SET customer_id = ?, total_amount = ?, status = ?, notes = ?, updated_at = NOW()
        WHERE id = ?
      `, [customer_id, total_amount, status || 'pending', notes || null, id]);

      req.flash('success', 'Cập nhật đơn hàng thành công!');
      res.redirect('/admin/orders');
    } catch (error) {
      console.error('Error in postEditOrder:', error);
      req.flash('error', 'Có lỗi xảy ra khi cập nhật đơn hàng');
      res.redirect(`/admin/orders/${id}/edit`);
    }
  }

  // Reviews management
  static async getReviews(req, res) {
    try {
      if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/login');
      }

      // Mock data for reviews
      const reviews = [
        {
          id: 1,
          customer_name: 'Trần Thị B',
          rating: 5,
          content: 'Dịch vụ rất tốt, nhân viên thân thiện',
          service_name: 'Cắt tóc nam',
          status: 'pending',
          created_at: '2024-01-15'
        }
      ];
      
      res.render('admin/reviews', {
        title: 'Quản lý Đánh giá',
        user: req.session.user,
        reviews
      });
    } catch (error) {
      console.error('Error in getReviews:', error);
      res.status(500).render('error', { 
        message: 'Có lỗi xảy ra khi tải danh sách đánh giá',
        error: error 
      });
    }
  }

  // Customers management
  static async getCustomers(req, res) {
    try {
      if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/login');
      }

      // Lấy tất cả users từ database (chỉ những user có role = 'customer')
      const allUsers = await User.findAll();
      const customers = allUsers.filter(user => user.role === 'customer').map(user => {
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone || 'Chưa có',
          address: user.address || 'Chưa có địa chỉ',
          status: 'active', // Mặc định active cho tất cả user
          created_at: user.created_at,
          orders_count: 0 // Sẽ cập nhật sau khi có bảng orders
        };
      });
      
      console.log('📋 Đã lấy được', customers.length, 'khách hàng từ database');
      
      res.render('admin/customers', {
        title: 'Quản lý Khách hàng',
        user: req.session.user,
        customers
      });
    } catch (error) {
      console.error('❌ Error in getCustomers:', error);
      res.status(500).render('error', { 
        message: 'Có lỗi xảy ra khi tải danh sách khách hàng',
        error: error 
      });
    }
  }

  // Contact messages management
  static async getContactMessages(req, res) {
    try {
      if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/login');
      }

      // Mock data for messages
      const messages = [
        {
          id: 1,
          name: 'Nguyễn Văn A',
          email: 'nguyenvana@example.com',
          subject: 'Hỏi về dịch vụ',
          message: 'Tôi muốn hỏi về dịch vụ cắt tóc',
          status: 'unread',
          created_at: '2024-01-15'
        }
      ];
      
      res.render('admin/contact', {
        title: 'Quản lý Tin nhắn',
        user: req.session.user,
        messages
      });
    } catch (error) {
      console.error('Error in getContactMessages:', error);
      res.status(500).render('error', { 
        message: 'Có lỗi xảy ra khi tải danh sách tin nhắn',
        error: error 
      });
    }
  }

  // Settings management
  static async getSettings(req, res) {
    try {
      if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/login');
      }

      res.render('admin/settings', {
        title: 'Cài đặt Hệ thống',
        user: req.session.user
      });
    } catch (error) {
      console.error('Error in getSettings:', error);
      res.status(500).render('error', { 
        message: 'Có lỗi xảy ra khi tải trang cài đặt',
        error: error 
      });
    }
  }

  // Placeholder methods for other routes
  static async getAddOrder(req, res) { res.json({ message: 'Not implemented' }); }
  static async postAddOrder(req, res) { res.json({ message: 'Not implemented' }); }
  static async getViewOrder(req, res) { res.json({ message: 'Not implemented' }); }
  static async getEditOrder(req, res) { res.json({ message: 'Not implemented' }); }
  static async postEditOrder(req, res) { res.json({ message: 'Not implemented' }); }
  static async deleteOrder(req, res) { res.json({ message: 'Not implemented' }); }
  static async approveReview(req, res) { res.json({ message: 'Not implemented' }); }
  static async rejectReview(req, res) { res.json({ message: 'Not implemented' }); }
  static async deleteReview(req, res) { res.json({ message: 'Not implemented' }); }
  // Xem chi tiết khách hàng
  static async getViewCustomer(req, res) {
    try {
      if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/login');
      }

      const customerId = req.params.id;
      const customer = await User.findById(customerId);
      
      if (!customer || customer.role !== 'customer') {
        return res.status(404).render('error', { 
          message: 'Không tìm thấy khách hàng',
          error: { status: 404 }
        });
      }

      res.render('admin/customers/view', {
        title: 'Chi tiết Khách hàng',
        user: req.session.user,
        customer
      });
    } catch (error) {
      console.error('❌ Error in getViewCustomer:', error);
      res.status(500).render('error', { 
        message: 'Có lỗi xảy ra khi tải thông tin khách hàng',
        error: error 
      });
    }
  }

  // Sửa thông tin khách hàng
  static async getEditCustomer(req, res) {
    try {
      if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/login');
      }

      const customerId = req.params.id;
      const customer = await User.findById(customerId);
      
      if (!customer || customer.role !== 'customer') {
        return res.status(404).render('error', { 
          message: 'Không tìm thấy khách hàng',
          error: { status: 404 }
        });
      }

      res.render('admin/customers/edit', {
        title: 'Sửa thông tin Khách hàng',
        user: req.session.user,
        customer
      });
    } catch (error) {
      console.error('❌ Error in getEditCustomer:', error);
      res.status(500).render('error', { 
        message: 'Có lỗi xảy ra khi tải thông tin khách hàng',
        error: error 
      });
    }
  }

  // Cập nhật thông tin khách hàng
  static async postEditCustomer(req, res) {
    try {
      if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/login');
      }

      const customerId = req.params.id;
      const { name, email, phone, address } = req.body;

      // Kiểm tra customer có tồn tại không
      const existingCustomer = await User.findById(customerId);
      if (!existingCustomer || existingCustomer.role !== 'customer') {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy khách hàng'
        });
      }

      // Cập nhật thông tin
      const updated = await User.update(customerId, {
        name,
        email,
        phone,
        address
      });

      if (updated) {
        console.log('✅ Đã cập nhật thông tin khách hàng ID:', customerId);
        res.json({
          success: true,
          message: 'Cập nhật thông tin khách hàng thành công!'
        });
      } else {
        res.json({
          success: false,
          message: 'Không thể cập nhật thông tin khách hàng'
        });
      }
    } catch (error) {
      console.error('❌ Error in postEditCustomer:', error);
      res.json({
        success: false,
        message: 'Có lỗi xảy ra khi cập nhật thông tin khách hàng'
      });
    }
  }

  // Xóa khách hàng
  static async deleteCustomer(req, res) {
    try {
      if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/login');
      }

      const customerId = req.params.id;

      // Kiểm tra customer có tồn tại không
      const existingCustomer = await User.findById(customerId);
      if (!existingCustomer || existingCustomer.role !== 'customer') {
        return res.json({
          success: false,
          message: 'Không tìm thấy khách hàng'
        });
      }

      // Xóa customer
      const deleted = await User.delete(customerId);

      if (deleted) {
        console.log('✅ Đã xóa khách hàng ID:', customerId);
        res.json({
          success: true,
          message: 'Xóa khách hàng thành công!'
        });
      } else {
        res.json({
          success: false,
          message: 'Không thể xóa khách hàng'
        });
      }
    } catch (error) {
      console.error('❌ Error in deleteCustomer:', error);
      res.json({
        success: false,
        message: 'Có lỗi xảy ra khi xóa khách hàng'
      });
    }
  }

  // Thêm khách hàng mới (form)
  static async getAddCustomer(req, res) {
    try {
      if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/login');
      }

      res.render('admin/customers/add', {
        title: 'Thêm Khách hàng mới',
        user: req.session.user
      });
    } catch (error) {
      console.error('❌ Error in getAddCustomer:', error);
      res.status(500).render('error', { 
        message: 'Có lỗi xảy ra khi tải trang thêm khách hàng',
        error: error 
      });
    }
  }

  // Thêm khách hàng mới (xử lý)
  static async postAddCustomer(req, res) {
    try {
      if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/login');
      }

      const { name, email, phone, password, address } = req.body;

      // Kiểm tra email đã tồn tại chưa
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.json({
          success: false,
          message: 'Email đã được sử dụng'
        });
      }

      // Tạo khách hàng mới
      const customerId = await User.create({
        name,
        email,
        phone,
        password,
        address,
        role: 'customer'
      });

      if (customerId) {
        console.log('✅ Đã tạo khách hàng mới với ID:', customerId);
        res.json({
          success: true,
          message: 'Thêm khách hàng thành công!'
        });
      } else {
        res.json({
          success: false,
          message: 'Không thể tạo khách hàng mới'
        });
      }
    } catch (error) {
      console.error('❌ Error in postAddCustomer:', error);
      res.json({
        success: false,
        message: 'Có lỗi xảy ra khi thêm khách hàng mới'
      });
    }
  }
  static async getViewMessage(req, res) { res.json({ message: 'Not implemented' }); }
  static async getReplyMessage(req, res) { res.json({ message: 'Not implemented' }); }
  static async postReplyMessage(req, res) { res.json({ message: 'Not implemented' }); }
  static async deleteMessage(req, res) { res.json({ message: 'Not implemented' }); }
  static async saveGeneralSettings(req, res) { res.json({ message: 'Not implemented' }); }
  static async saveEmailSettings(req, res) { res.json({ message: 'Not implemented' }); }
  static async saveNotificationSettings(req, res) { res.json({ message: 'Not implemented' }); }
  static async saveSystemSettings(req, res) { res.json({ message: 'Not implemented' }); }
}

module.exports = AdminController;

