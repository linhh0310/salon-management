const db = require('../config/db');

class Service {
  // Tạo service mới
  static async create(serviceData) {
    const { name, description, price, duration, category_id, is_active } = serviceData;
    const query = `
      INSERT INTO services (name, description, price, duration, category_id, is_active) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    try {
      const [result] = await db.execute(query, [name, description, price, duration, category_id, is_active]);
      return result.insertId;
    } catch (error) {
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
    const query = `
      UPDATE services 
      SET name = ?, description = ?, price = ?, duration = ?, category_id = ?, is_active = ?
      WHERE id = ?
    `;
    
    try {
      const [result] = await db.execute(query, [name, description, price, duration, category_id, is_active, id]);
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