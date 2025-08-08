const User = require('../models/userModel');
const Appointment = require('../models/appointmentModel');
const Service = require('../models/serviceModel');
const Stylist = require('../models/stylistModel');
const Category = require('../models/categoryModel');
const Employee = require('../models/employeeModel');
const { validationResult } = require('express-validator');

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

      const { status, from_date, to_date, page = 1 } = req.query;
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

      const totalAppointments = appointments.length;
      const totalPages = Math.ceil(totalAppointments / limit);
      const paginatedAppointments = appointments.slice(offset, offset + limit);
      
      res.render('admin/appointments', {
        title: 'Quản lý lịch hẹn',
        user: req.session.user,
        appointments: paginatedAppointments,
        currentPage: parseInt(page),
        totalPages,
        status,
        from_date,
        to_date
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

  // Xóa appointment
  static async deleteAppointment(req, res) {
    try {
      if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/login');
      }

      const { id } = req.params;
      
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

      const services = await Service.findAll();
      
      res.render('admin/services', {
        title: 'Quản lý dịch vụ',
        user: req.session.user,
        services
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
  static getAddService(req, res) {
    if (!req.session.user || req.session.user.role !== 'admin') {
      return res.redirect('/login');
    }

    res.render('admin/addService', {
      title: 'Thêm dịch vụ mới',
      user: req.session.user
    });
  }

  // Xử lý thêm service
  static async postAddService(req, res) {
    try {
      if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/login');
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.render('admin/addService', {
          title: 'Thêm dịch vụ mới',
          user: req.session.user,
          errors: errors.array(),
          ...req.body // Giữ lại dữ liệu đã nhập
        });
      }

      const { name, description, price, duration, category } = req.body;
      
      await Service.create({ name, description, price, duration, category });
      
      req.flash('success', 'Thêm dịch vụ thành công!');
      res.redirect('/admin/services');
    } catch (error) {
      console.error('Error in postAddService:', error);
      res.render('admin/addService', {
        title: 'Thêm dịch vụ mới',
        user: req.session.user,
        errors: [{ msg: 'Có lỗi xảy ra khi thêm dịch vụ' }],
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
      
      if (!service) {
        req.flash('error', 'Không tìm thấy dịch vụ');
        return res.redirect('/admin/services');
      }

      res.render('admin/editService', {
        title: 'Chỉnh sửa dịch vụ',
        user: req.session.user,
        service
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
        
        return res.render('admin/editService', {
          title: 'Chỉnh sửa dịch vụ',
          user: req.session.user,
          service,
          errors: errors.array()
        });
      }

      const { id } = req.params;
      const { name, description, price, duration, category } = req.body;
      
      await Service.update(id, { name, description, price, duration, category });
      
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

      const stylists = await Stylist.findAll();
      
      res.render('admin/stylists', {
        title: 'Quản lý stylist',
        user: req.session.user,
        stylists
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
  static getAddStylist(req, res) {
    if (!req.session.user || req.session.user.role !== 'admin') {
      return res.redirect('/login');
    }

    res.render('admin/addStylist', {
      title: 'Thêm stylist mới',
      user: req.session.user
    });
  }

  // Xử lý thêm stylist
  static async postAddStylist(req, res) {
    try {
      if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/login');
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.render('admin/addStylist', {
          title: 'Thêm stylist mới',
          user: req.session.user,
          errors: errors.array(),
          ...req.body // Giữ lại dữ liệu đã nhập
        });
      }

      const { name, phone, email, specialties, experience, status = 'active' } = req.body;
      
      await Stylist.create({ name, phone, email, specialties, experience, status });
      
      req.flash('success', 'Thêm stylist thành công!');
      res.redirect('/admin/stylists');
    } catch (error) {
      console.error('Error in postAddStylist:', error);
      res.render('admin/addStylist', {
        title: 'Thêm stylist mới',
        user: req.session.user,
        errors: [{ msg: 'Có lỗi xảy ra khi thêm stylist' }],
        ...req.body // Giữ lại dữ liệu đã nhập
      });
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

      res.render('admin/editStylist', {
        title: 'Chỉnh sửa stylist',
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

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const { id } = req.params;
        const stylist = await Stylist.findById(id);
        
        return res.render('admin/editStylist', {
          title: 'Chỉnh sửa stylist',
          user: req.session.user,
          stylist,
          errors: errors.array()
        });
      }

      const { id } = req.params;
      const { name, phone, email, specialties, experience, status } = req.body;
      
      await Stylist.update(id, { name, phone, email, specialties, experience, status });
      
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

      const Product = require('../models/productModel');
      const products = await Product.findAll();
      const categories = await Category.findAll();
      
      res.render('admin/products', {
        title: 'Quản lý Sản phẩm',
        user: req.session.user,
        products,
        categories
      });
    } catch (error) {
      console.error('Error in getProducts:', error);
      res.status(500).render('error', { 
        message: 'Có lỗi xảy ra khi tải danh sách sản phẩm',
        error: error 
      });
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

      // Mock data for orders
      const orders = [
        {
          id: 1,
          customer_name: 'Nguyễn Văn A',
          items_count: 3,
          total_amount: 500000,
          status: 'pending',
          created_at: '2024-01-15'
        }
      ];
      
      res.render('admin/orders', {
        title: 'Quản lý Đơn hàng',
        user: req.session.user,
        orders
      });
    } catch (error) {
      console.error('Error in getOrders:', error);
      res.status(500).render('error', { 
        message: 'Có lỗi xảy ra khi tải danh sách đơn hàng',
        error: error 
      });
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

