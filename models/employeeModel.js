const db = require('../config/db');

class Employee {
  // Tạo employee mới
  static async create(employeeData) {
    try {
      const {
        employee_id,
        full_name,
        email,
        phone,
        address,
        birth_date,
        birth_place,
        id_card,
        issue_date,
        issue_place,
        gender,
        position,
        qualification,
        marital_status,
        photo,
        status = 'active'
      } = employeeData;

      const [result] = await db.execute(
        `INSERT INTO employees (
          employee_id, full_name, email, phone, address, 
          birth_date, birth_place, id_card, issue_date, issue_place,
          gender, position, qualification, marital_status, photo, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          employee_id, full_name, email, phone, address,
          birth_date, birth_place, id_card, issue_date, issue_place,
          gender, position, qualification, marital_status, photo, status
        ]
      );
      
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  // Tìm employee theo ID
  static async findById(id) {
    try {
      const [rows] = await db.execute(
        'SELECT * FROM employees WHERE id = ?',
        [id]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Tìm employee theo employee_id
  static async findByEmployeeId(employeeId) {
    try {
      const [rows] = await db.execute(
        'SELECT * FROM employees WHERE employee_id = ?',
        [employeeId]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Cập nhật thông tin employee
  static async update(id, employeeData) {
    try {
      const {
        employee_id,
        full_name,
        email,
        phone,
        address,
        birth_date,
        birth_place,
        id_card,
        issue_date,
        issue_place,
        gender,
        position,
        qualification,
        marital_status,
        photo,
        status
      } = employeeData;

      const [result] = await db.execute(
        `UPDATE employees SET 
          employee_id = ?, full_name = ?, email = ?, phone = ?, address = ?,
          birth_date = ?, birth_place = ?, id_card = ?, issue_date = ?, issue_place = ?,
          gender = ?, position = ?, qualification = ?, marital_status = ?, 
          photo = ?, status = ?, updated_at = NOW()
        WHERE id = ?`,
        [
          employee_id, full_name, email, phone, address,
          birth_date, birth_place, id_card, issue_date, issue_place,
          gender, position, qualification, marital_status, photo, status, id
        ]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Xóa employee
  static async delete(id) {
    try {
      const [result] = await db.execute(
        'DELETE FROM employees WHERE id = ?',
        [id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Lấy danh sách tất cả employees
  static async findAll() {
    try {
      const [rows] = await db.execute(
        'SELECT * FROM employees ORDER BY created_at DESC'
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Tìm kiếm employees
  static async search(keyword) {
    try {
      const [rows] = await db.execute(
        `SELECT * FROM employees 
         WHERE full_name LIKE ? OR email LIKE ? OR phone LIKE ? OR employee_id LIKE ?
         ORDER BY created_at DESC`,
        [`%${keyword}%`, `%${keyword}%`, `%${keyword}%`, `%${keyword}%`]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Lọc employees theo position
  static async findByPosition(position) {
    try {
      const [rows] = await db.execute(
        'SELECT * FROM employees WHERE position = ? ORDER BY created_at DESC',
        [position]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Lọc employees theo status
  static async findByStatus(status) {
    try {
      const [rows] = await db.execute(
        'SELECT * FROM employees WHERE status = ? ORDER BY created_at DESC',
        [status]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Đếm tổng số employees
  static async count() {
    try {
      const [rows] = await db.execute('SELECT COUNT(*) as total FROM employees');
      return rows[0].total;
    } catch (error) {
      throw error;
    }
  }

  // Đếm employees theo status
  static async countByStatus(status) {
    try {
      const [rows] = await db.execute(
        'SELECT COUNT(*) as total FROM employees WHERE status = ?',
        [status]
      );
      return rows[0].total;
    } catch (error) {
      throw error;
    }
  }

  // Toggle status
  static async toggleStatus(id) {
    try {
      const [result] = await db.execute(
        `UPDATE employees 
         SET status = CASE WHEN status = 'active' THEN 'inactive' ELSE 'active' END,
             updated_at = NOW()
         WHERE id = ?`,
        [id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Employee; 