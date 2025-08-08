const Category = require('../models/categoryModel');
const { validationResult } = require('express-validator');

class CategoryController {
  // Hiển thị danh sách danh mục
  static async getCategories(req, res) {
    try {
      if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/login');
      }

      const categories = await Category.findAll();
      const totalCategories = await Category.count();

      res.render('admin/categories', {
        title: 'Quản lý Danh mục',
        user: req.session.user,
        categories,
        totalCategories
      });
    } catch (error) {
      console.error('Error in getCategories:', error);
      req.flash('error', 'Có lỗi xảy ra khi tải danh sách danh mục');
      res.redirect('/admin');
    }
  }

  // Hiển thị form thêm danh mục
  static async getAddCategory(req, res) {
    try {
      if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/login');
      }

      const parentCategories = await Category.findParents();

      res.render('admin/addCategory', {
        title: 'Thêm Danh mục',
        user: req.session.user,
        parentCategories
      });
    } catch (error) {
      console.error('Error in getAddCategory:', error);
      req.flash('error', 'Có lỗi xảy ra khi tải form thêm danh mục');
      res.redirect('/admin/categories');
    }
  }

  // Xử lý thêm danh mục
  static async postAddCategory(req, res) {
    try {
      if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/login');
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const parentCategories = await Category.findParents();
        return res.render('admin/addCategory', {
          title: 'Thêm Danh mục',
          user: req.session.user,
          parentCategories,
          errors: errors.array(),
          oldData: req.body
        });
      }

      const {
        name,
        description,
        parent_id,
        module,
        show_home,
        show_menu,
        is_active,
        sort_order
      } = req.body;

      const categoryData = {
        name,
        description,
        parent_id: parent_id || 0,
        module,
        show_home: show_home === 'on',
        show_menu: show_menu === 'on',
        is_active: is_active === 'on',
        sort_order: sort_order || 0
      };

      await Category.create(categoryData);

      req.flash('success', 'Thêm danh mục thành công!');
      res.redirect('/admin/categories');
    } catch (error) {
      console.error('Error in postAddCategory:', error);
      req.flash('error', 'Có lỗi xảy ra khi thêm danh mục');
      res.redirect('/admin/categories');
    }
  }

  // Hiển thị form sửa danh mục
  static async getEditCategory(req, res) {
    try {
      if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/login');
      }

      const { id } = req.params;
      const category = await Category.findById(id);
      
      if (!category) {
        req.flash('error', 'Không tìm thấy danh mục');
        return res.redirect('/admin/categories');
      }

      const parentCategories = await Category.findParents();

      res.render('admin/editCategory', {
        title: 'Sửa Danh mục',
        user: req.session.user,
        category,
        parentCategories
      });
    } catch (error) {
      console.error('Error in getEditCategory:', error);
      req.flash('error', 'Có lỗi xảy ra khi tải form sửa danh mục');
      res.redirect('/admin/categories');
    }
  }

  // Xử lý sửa danh mục
  static async postEditCategory(req, res) {
    try {
      if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/login');
      }

      const { id } = req.params;
      const errors = validationResult(req);
      
      if (!errors.isEmpty()) {
        const category = await Category.findById(id);
        const parentCategories = await Category.findParents();
        
        return res.render('admin/editCategory', {
          title: 'Sửa Danh mục',
          user: req.session.user,
          category,
          parentCategories,
          errors: errors.array(),
          oldData: req.body
        });
      }

      const {
        name,
        description,
        parent_id,
        module,
        show_home,
        show_menu,
        is_active,
        sort_order
      } = req.body;

      const categoryData = {
        name,
        description,
        parent_id: parent_id || 0,
        module,
        show_home: show_home === 'on',
        show_menu: show_menu === 'on',
        is_active: is_active === 'on',
        sort_order: sort_order || 0
      };

      await Category.update(id, categoryData);

      req.flash('success', 'Cập nhật danh mục thành công!');
      res.redirect('/admin/categories');
    } catch (error) {
      console.error('Error in postEditCategory:', error);
      req.flash('error', 'Có lỗi xảy ra khi cập nhật danh mục');
      res.redirect('/admin/categories');
    }
  }

  // Xóa danh mục
  static async deleteCategory(req, res) {
    try {
      if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/login');
      }

      const { id } = req.params;
      
      await Category.delete(id);
      
      req.flash('success', 'Xóa danh mục thành công!');
      res.redirect('/admin/categories');
    } catch (error) {
      console.error('Error in deleteCategory:', error);
      req.flash('error', error.message || 'Có lỗi xảy ra khi xóa danh mục');
      res.redirect('/admin/categories');
    }
  }

  // Toggle trạng thái hiển thị
  static async toggleStatus(req, res) {
    try {
      if (!req.session.user || req.session.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Không có quyền truy cập' });
      }

      const { id } = req.params;
      const { field } = req.body;

      const validFields = ['show_home', 'show_menu', 'is_active'];
      if (!validFields.includes(field)) {
        return res.status(400).json({ success: false, message: 'Field không hợp lệ' });
      }

      await Category.toggleStatus(id, field);
      
      res.json({ success: true, message: 'Cập nhật trạng thái thành công' });
    } catch (error) {
      console.error('Error in toggleStatus:', error);
      res.status(500).json({ success: false, message: 'Có lỗi xảy ra' });
    }
  }

  // API lấy danh mục theo module
  static async getCategoriesByModule(req, res) {
    try {
      const { module } = req.params;
      const categories = await Category.findByModule(module);
      
      res.json({ success: true, categories });
    } catch (error) {
      console.error('Error in getCategoriesByModule:', error);
      res.status(500).json({ success: false, message: 'Có lỗi xảy ra' });
    }
  }

  // API lấy cây danh mục
  static async getCategoryTree(req, res) {
    try {
      const tree = await Category.getTree();
      res.json({ success: true, tree });
    } catch (error) {
      console.error('Error in getCategoryTree:', error);
      res.status(500).json({ success: false, message: 'Có lỗi xảy ra' });
    }
  }
}

module.exports = CategoryController; 