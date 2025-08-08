const db = require('../config/db');

class Category {
  // Lấy tất cả danh mục
  static async findAll() {
    try {
      const [rows] = await db.execute(`
        SELECT * FROM categories 
        ORDER BY parent_id ASC, sort_order ASC, name ASC
      `);
      return rows;
    } catch (error) {
      console.error('Error in Category.findAll:', error);
      throw error;
    }
  }

  // Lấy danh mục theo ID
  static async findById(id) {
    try {
      const [rows] = await db.execute(
        'SELECT * FROM categories WHERE id = ?',
        [id]
      );
      return rows[0];
    } catch (error) {
      console.error('Error in Category.findById:', error);
      throw error;
    }
  }

  // Lấy danh mục cha (parent_id = 0 hoặc NULL)
  static async findParents() {
    try {
      const [rows] = await db.execute(`
        SELECT * FROM categories 
        WHERE parent_id = 0 OR parent_id IS NULL
        ORDER BY sort_order ASC, name ASC
      `);
      return rows;
    } catch (error) {
      console.error('Error in Category.findParents:', error);
      throw error;
    }
  }

  // Lấy danh mục con theo parent_id
  static async findChildren(parentId) {
    try {
      const [rows] = await db.execute(
        'SELECT * FROM categories WHERE parent_id = ? ORDER BY sort_order ASC, name ASC',
        [parentId]
      );
      return rows;
    } catch (error) {
      console.error('Error in Category.findChildren:', error);
      throw error;
    }
  }

  // Tạo danh mục mới
  static async create(categoryData) {
    try {
      const { name, description, parent_id, module, show_home, show_menu, is_active, sort_order } = categoryData;
      
      const [result] = await db.execute(`
        INSERT INTO categories (name, description, parent_id, module, show_home, show_menu, is_active, sort_order, created_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `, [name, description, parent_id || 0, module, show_home ? 1 : 0, show_menu ? 1 : 0, is_active ? 1 : 0, sort_order || 0]);
      
      return result.insertId;
    } catch (error) {
      console.error('Error in Category.create:', error);
      throw error;
    }
  }

  // Cập nhật danh mục
  static async update(id, categoryData) {
    try {
      const { name, description, parent_id, module, show_home, show_menu, is_active, sort_order } = categoryData;
      
      const [result] = await db.execute(`
        UPDATE categories 
        SET name = ?, description = ?, parent_id = ?, module = ?, 
            show_home = ?, show_menu = ?, is_active = ?, sort_order = ?, updated_at = NOW()
        WHERE id = ?
      `, [name, description, parent_id || 0, module, show_home ? 1 : 0, show_menu ? 1 : 0, is_active ? 1 : 0, sort_order || 0, id]);
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error in Category.update:', error);
      throw error;
    }
  }

  // Xóa danh mục
  static async delete(id) {
    try {
      // Kiểm tra xem có danh mục con không
      const children = await this.findChildren(id);
      if (children.length > 0) {
        throw new Error('Không thể xóa danh mục có danh mục con');
      }

      const [result] = await db.execute('DELETE FROM categories WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error in Category.delete:', error);
      throw error;
    }
  }

  // Đếm tổng số danh mục
  static async count() {
    try {
      const [rows] = await db.execute('SELECT COUNT(*) as total FROM categories');
      return rows[0].total;
    } catch (error) {
      console.error('Error in Category.count:', error);
      throw error;
    }
  }

  // Lấy danh mục theo module
  static async findByModule(module) {
    try {
      const [rows] = await db.execute(
        'SELECT * FROM categories WHERE module = ? AND is_active = 1 ORDER BY sort_order ASC, name ASC',
        [module]
      );
      return rows;
    } catch (error) {
      console.error('Error in Category.findByModule:', error);
      throw error;
    }
  }

  // Toggle trạng thái hiển thị
  static async toggleStatus(id, field) {
    try {
      const validFields = ['show_home', 'show_menu', 'is_active'];
      if (!validFields.includes(field)) {
        throw new Error('Field không hợp lệ');
      }

      const [result] = await db.execute(`
        UPDATE categories 
        SET ${field} = NOT ${field}, updated_at = NOW()
        WHERE id = ?
      `, [id]);
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error in Category.toggleStatus:', error);
      throw error;
    }
  }

  // Lấy cây danh mục (hierarchical)
  static async getTree() {
    try {
      const allCategories = await this.findAll();
      const tree = [];
      const lookup = {};

      // Tạo lookup table
      allCategories.forEach(category => {
        lookup[category.id] = { ...category, children: [] };
      });

      // Xây dựng cây
      allCategories.forEach(category => {
        if (category.parent_id === 0 || category.parent_id === null) {
          tree.push(lookup[category.id]);
        } else {
          if (lookup[category.parent_id]) {
            lookup[category.parent_id].children.push(lookup[category.id]);
          }
        }
      });

      return tree;
    } catch (error) {
      console.error('Error in Category.getTree:', error);
      throw error;
    }
  }
}

module.exports = Category; 