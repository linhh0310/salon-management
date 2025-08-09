const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const categoryController = require('../controllers/categoryController');
const { body } = require('express-validator');

// Middleware kiểm tra admin
const requireAdmin = (req, res, next) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    req.flash('error', 'Bạn không có quyền truy cập trang này');
    return res.redirect('/login');
  }
  next();
};

// Validation cho service
const serviceValidation = [
  body('name').notEmpty().withMessage('Tên dịch vụ không được để trống'),
  body('price').isNumeric().withMessage('Giá phải là số'),
  body('duration').isNumeric().withMessage('Thời gian phải là số'),
  body('category').notEmpty().withMessage('Danh mục không được để trống')
];

// Validation cho stylist
const stylistValidation = [
  body('name').notEmpty().withMessage('Tên stylist không được để trống'),
  body('phone').notEmpty().withMessage('Số điện thoại không được để trống'),
  body('email').optional().isEmail().withMessage('Email không hợp lệ'),
  body('experience').isNumeric().withMessage('Số năm kinh nghiệm phải là số')
];

// Validation cho employee
const employeeValidation = [
  body('employee_id').notEmpty().withMessage('Mã nhân viên không được để trống'),
  body('full_name').notEmpty().withMessage('Họ và tên không được để trống'),
  body('email').optional().isEmail().withMessage('Email không hợp lệ'),
  body('phone').optional().isMobilePhone('vi-VN').withMessage('Số điện thoại không hợp lệ'),
  body('birth_date').optional().isDate().withMessage('Ngày sinh không hợp lệ'),
  body('issue_date').optional().isDate().withMessage('Ngày cấp CMND không hợp lệ')
];

// Validation cho category
const categoryValidation = [
  body('name').notEmpty().withMessage('Tên danh mục không được để trống'),
  body('module').notEmpty().withMessage('Module không được để trống'),
  body('sort_order').optional().isNumeric().withMessage('Thứ tự sắp xếp phải là số')
];

// Dashboard admin
router.get('/', requireAdmin, adminController.getDashboard);
router.get('/dashboard', requireAdmin, adminController.getDashboard);

// Quản lý users
router.get('/users', requireAdmin, adminController.getUsers);
router.post('/users/:id/delete', requireAdmin, adminController.deleteUser);

// Quản lý appointments
router.get('/appointments', requireAdmin, adminController.getAppointments);
router.post('/appointments/:id/status', requireAdmin, adminController.updateAppointmentStatus);
router.post('/appointments/:id/delete', requireAdmin, adminController.deleteAppointment);

// Quản lý services
router.get('/services', requireAdmin, adminController.getServices);
router.get('/services/add', requireAdmin, adminController.getAddService);
router.post('/services/add', requireAdmin, serviceValidation, adminController.postAddService);
router.get('/services/:id/edit', requireAdmin, adminController.getEditService);
router.post('/services/:id/edit', requireAdmin, serviceValidation, adminController.postEditService);
router.post('/services/:id/delete', requireAdmin, adminController.deleteService);

// Quản lý stylists
router.get('/stylists', requireAdmin, adminController.getStylists);
router.get('/stylists/add', requireAdmin, adminController.getAddStylist);
router.post('/stylists/add', requireAdmin, stylistValidation, adminController.postAddStylist);
router.get('/stylists/:id/edit', requireAdmin, adminController.getEditStylist);
router.post('/stylists/:id/edit', requireAdmin, stylistValidation, adminController.postEditStylist);
router.post('/stylists/:id/delete', requireAdmin, adminController.deleteStylist);

// Quản lý products
router.get('/products', requireAdmin, adminController.getProducts);
router.get('/products/add', requireAdmin, adminController.getAddProduct);
router.post('/products/add', requireAdmin, adminController.postAddProduct);
router.get('/products/:id/edit', requireAdmin, adminController.getEditProduct);
router.post('/products/:id/edit', requireAdmin, adminController.postEditProduct);
router.post('/products/:id/delete', requireAdmin, adminController.deleteProduct);

// Quản lý categories
router.get('/categories', requireAdmin, categoryController.getCategories);
router.get('/categories/add', requireAdmin, categoryController.getAddCategory);
router.post('/categories/add', requireAdmin, categoryValidation, categoryController.postAddCategory);
router.get('/categories/:id/edit', requireAdmin, categoryController.getEditCategory);
router.post('/categories/:id/edit', requireAdmin, categoryValidation, categoryController.postEditCategory);
router.post('/categories/:id/delete', requireAdmin, categoryController.deleteCategory);
router.post('/categories/:id/toggle-status', requireAdmin, categoryController.toggleStatus);

// Quản lý employees
router.get('/employees', requireAdmin, adminController.getEmployees);
router.get('/employees/add', requireAdmin, adminController.getAddEmployee);
router.post('/employees/add', requireAdmin, employeeValidation, adminController.postAddEmployee);
router.get('/employees/:id/view', requireAdmin, adminController.getViewEmployee);
router.get('/employees/:id/edit', requireAdmin, adminController.getEditEmployee);
router.post('/employees/:id/edit', requireAdmin, employeeValidation, adminController.postEditEmployee);
router.post('/employees/:id/delete', requireAdmin, adminController.deleteEmployee);

// Quản lý orders
router.get('/orders', requireAdmin, adminController.getOrders);
router.get('/orders/:id/view', requireAdmin, adminController.getViewOrder);
router.post('/orders/:id/status', requireAdmin, adminController.updateOrderStatus);
router.post('/orders/:id/delete', requireAdmin, adminController.deleteOrder);

// Quản lý reviews
router.get('/reviews', requireAdmin, adminController.getReviews);
router.post('/reviews/:id/approve', requireAdmin, adminController.approveReview);
router.post('/reviews/:id/reject', requireAdmin, adminController.rejectReview);
router.post('/reviews/:id/delete', requireAdmin, adminController.deleteReview);

// Quản lý customers
router.get('/customers', requireAdmin, adminController.getCustomers);
router.get('/customers/add', requireAdmin, adminController.getAddCustomer);
router.post('/customers/add', requireAdmin, adminController.postAddCustomer);
router.get('/customers/:id/view', requireAdmin, adminController.getViewCustomer);
router.get('/customers/:id/edit', requireAdmin, adminController.getEditCustomer);
router.post('/customers/:id/edit', requireAdmin, adminController.postEditCustomer);
router.post('/customers/:id/delete', requireAdmin, adminController.deleteCustomer);

// Quản lý contact messages
router.get('/contact', requireAdmin, adminController.getContactMessages);
router.get('/contact/:id/view', requireAdmin, adminController.getViewMessage);
router.get('/contact/:id/reply', requireAdmin, adminController.getReplyMessage);
router.post('/contact/:id/reply', requireAdmin, adminController.postReplyMessage);
router.post('/contact/:id/delete', requireAdmin, adminController.deleteMessage);

// Quản lý settings
router.get('/settings', requireAdmin, adminController.getSettings);
router.post('/settings/general', requireAdmin, adminController.saveGeneralSettings);
router.post('/settings/email', requireAdmin, adminController.saveEmailSettings);
router.post('/settings/notification', requireAdmin, adminController.saveNotificationSettings);
router.post('/settings/system', requireAdmin, adminController.saveSystemSettings);

// API routes cho categories
router.get('/api/categories/module/:module', categoryController.getCategoriesByModule);
router.get('/api/categories/tree', categoryController.getCategoryTree);

module.exports = router;
