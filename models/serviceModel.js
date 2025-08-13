const db = require('../config/db');

class Service {
  // Tạo service mới
  static async create(serviceData) {
    const { name, description, price, duration, category_id, is_active } = serviceData;
    
    // Lấy tên category từ category_id
    let categoryName = '';
    if (category_id) {
      try {
        const [categoryRows] = await db.execute('SELECT name FROM categories WHERE id = ?', [category_id]);
        if (categoryRows.length > 0) {
          categoryName = categoryRows[0].name;
        }
      } catch (error) {
        console.error('❌ Lỗi khi lấy tên category:', error);
      }
    }
    
    const query = `
      INSERT INTO services (name, description, price, duration, category, category_id, is_active) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    console.log('🔍 Service.create - Query:', query);
    console.log('📦 Service.create - Parameters:', [name, description, price, duration, categoryName, category_id, is_active]);
    
    try {
      const [result] = await db.execute(query, [name, description, price, duration, categoryName, category_id, is_active]);
      console.log('✅ Service.create - Result:', result);
      return result.insertId;
    } catch (error) {
      console.error('❌ Service.create - Error:', error);
      console.error('📋 Error details:', error.message);
      throw error;
    }
  }

  // Tìm service theo ID
  static async findById(id) {
    const query = `
      SELECT s.*, c.name as category_name 
      FROM services s 
      LEFT JOIN categories c ON s.category_id = c.id 
      WHERE s.id = ?
    `;
    
    try {
      const [rows] = await db.execute(query, [id]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Lấy tất cả services
  static async findAll() {
    const query = `
      SELECT s.*, c.name as category_name 
      FROM services s 
      LEFT JOIN categories c ON s.category_id = c.id 
      ORDER BY s.name
    `;
    
    try {
      const [rows] = await db.execute(query);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Lấy services theo category
  static async findByCategory(categoryId) {
    const query = `
      SELECT s.*, c.name as category_name 
      FROM services s 
      LEFT JOIN categories c ON s.category_id = c.id 
      WHERE s.category_id = ? 
      ORDER BY s.name
    `;
    
    try {
      const [rows] = await db.execute(query, [categoryId]);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Cập nhật service
  static async update(id, serviceData) {
    const { name, description, price, duration, category_id, is_active } = serviceData;
    
    // Lấy tên category từ category_id
    let categoryName = '';
    if (category_id) {
      try {
        const [categoryRows] = await db.execute('SELECT name FROM categories WHERE id = ?', [category_id]);
        if (categoryRows.length > 0) {
          categoryName = categoryRows[0].name;
        }
      } catch (error) {
        console.error('❌ Lỗi khi lấy tên category:', error);
      }
    }
    
    const query = `
      UPDATE services 
      SET name = ?, description = ?, price = ?, duration = ?, category = ?, category_id = ?, is_active = ?
      WHERE id = ?
    `;
    
    try {
      const [result] = await db.execute(query, [name, description, price, duration, categoryName, category_id, is_active, id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Xóa service
  static async delete(id) {
    const query = 'DELETE FROM services WHERE id = ?';
    
    try {
      const [result] = await db.execute(query, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Lấy danh sách categories
  static async getCategories() {
    const query = 'SELECT * FROM categories ORDER BY name';
    
    try {
      const [rows] = await db.execute(query);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Đếm tổng số services
  static async count() {
    const query = 'SELECT COUNT(*) as total FROM services';
    
    try {
      const [rows] = await db.execute(query);
      return rows[0].total;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Service; 