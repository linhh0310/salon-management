const db = require('../config/db');
const bcrypt = require('bcryptjs');

class User {
  // Tạo user mới
  static async create(userData) {
    try {
      const { name, email, phone, password, role = 'customer', address } = userData;
      // Mã hóa password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const [result] = await db.execute(
        'INSERT INTO users (name, email, phone, password, role, address, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
        [name, email, phone, hashedPassword, role, address || null]
      );
      
      return result.insertId;
    } catch (error) {
      console.error('❌ Lỗi khi tạo user:', error);
      throw error;
    }
  }

  // Tìm user theo email
  static async findByEmail(email) {
    try {
      const [rows] = await db.execute(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Tìm user theo ID
  static async findById(id) {
    try {
      const [rows] = await db.execute(
        'SELECT id, name, email, phone, role, address, created_at FROM users WHERE id = ?',
        [id]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Cập nhật thông tin user
  static async update(id, userData) {
    try {
      const { name, email, phone, address } = userData;
      const [result] = await db.execute(
        'UPDATE users SET name = ?, email = ?, phone = ?, address = ? WHERE id = ?',
        [name, email, phone, address || null, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Xóa user
  static async delete(id) {
    try {
      const [result] = await db.execute(
        'DELETE FROM users WHERE id = ?',
        [id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Lấy danh sách tất cả users
  static async findAll() {
    try {
      const [rows] = await db.execute(
        'SELECT id, name, email, phone, role, address, created_at FROM users ORDER BY created_at DESC'
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Kiểm tra password
  static async verifyPassword(password, storedPassword) {
    // So sánh password đã mã hóa
    return await bcrypt.compare(password, storedPassword);
  }

  // Thay đổi password
  static async changePassword(id, newPassword) {
    try {
      // Mã hóa password mới
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const [result] = await db.execute(
        'UPDATE users SET password = ? WHERE id = ?',
        [hashedPassword, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = User;


