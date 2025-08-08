const db = require('../config/db');

class Service {
  // Tạo service mới
  static async create(serviceData) {
    const { name, description, price, duration, category } = serviceData;
    const query = `
      INSERT INTO services (name, description, price, duration, category) 
      VALUES (?, ?, ?, ?, ?)
    `;
    
    try {
      const [result] = await db.execute(query, [name, description, price, duration, category]);
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  // Tìm service theo ID
  static async findById(id) {
    const query = 'SELECT * FROM services WHERE id = ?';
    
    try {
      const [rows] = await db.execute(query, [id]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Lấy tất cả services
  static async findAll() {
    const query = 'SELECT * FROM services ORDER BY name';
    
    try {
      const [rows] = await db.execute(query);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Lấy services theo category
  static async findByCategory(category) {
    const query = 'SELECT * FROM services WHERE category = ? ORDER BY name';
    
    try {
      const [rows] = await db.execute(query, [category]);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Cập nhật service
  static async update(id, serviceData) {
    const { name, description, price, duration, category } = serviceData;
    const query = `
      UPDATE services 
      SET name = ?, description = ?, price = ?, duration = ?, category = ?
      WHERE id = ?
    `;
    
    try {
      const [result] = await db.execute(query, [name, description, price, duration, category, id]);
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
    const query = 'SELECT DISTINCT category FROM services WHERE category IS NOT NULL ORDER BY category';
    
    try {
      const [rows] = await db.execute(query);
      return rows.map(row => row.category);
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