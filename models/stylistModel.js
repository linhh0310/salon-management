const db = require('../config/db');

class Stylist {
  // Tạo stylist mới
  static async create(stylistData) {
    const { name, email, phone, experience, image } = stylistData;
    const query = `
      INSERT INTO stylists (name, email, phone, experience, image) 
      VALUES (?, ?, ?, ?, ?)
    `;
    
    try {
      const [result] = await db.execute(query, [name, email, phone, experience, image]);
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  // Tìm stylist theo ID
  static async findById(id) {
    const query = 'SELECT * FROM stylists WHERE id = ?';
    
    try {
      const [rows] = await db.execute(query, [id]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Lấy tất cả stylists
  static async findAll() {
    const query = 'SELECT * FROM stylists ORDER BY name';
    
    try {
      const [rows] = await db.execute(query);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Lấy stylists đang hoạt động
  static async findActive() {
    const query = 'SELECT * FROM stylists ORDER BY name';
    
    try {
      const [rows] = await db.execute(query);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Cập nhật stylist
  static async update(id, stylistData) {
    const { name, email, phone, experience, image } = stylistData;
    const query = `
      UPDATE stylists 
      SET name = ?, email = ?, phone = ?, experience = ?, image = ?
      WHERE id = ?
    `;
    
    try {
      const [result] = await db.execute(query, [name, email, phone, experience, image, id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Xóa stylist
  static async delete(id) {
    const query = 'DELETE FROM stylists WHERE id = ?';
    
    try {
      const [result] = await db.execute(query, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Lấy lịch làm việc của stylist
  static async getSchedule(stylistId, date) {
    const query = `
      SELECT a.*, u.name as customer_name, s.name as service_name
      FROM appointments a
      JOIN users u ON a.user_id = u.id
      JOIN services s ON a.service_id = s.id
      WHERE a.stylist_id = ? AND DATE(a.appointment_date) = ?
      ORDER BY a.appointment_time
    `;
    
    try {
      const [rows] = await db.execute(query, [stylistId, date]);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Lấy thống kê stylist
  static async getStats() {
    const query = `
      SELECT 
        COUNT(*) as total_stylists,
        COUNT(*) as active_stylists,
        0 as inactive_stylists
      FROM stylists
    `;
    
    try {
      const [rows] = await db.execute(query);
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Đếm tổng số stylists
  static async count() {
    const query = 'SELECT COUNT(*) as total FROM stylists';
    
    try {
      const [rows] = await db.execute(query);
      return rows[0].total;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Stylist; 