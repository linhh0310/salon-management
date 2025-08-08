const db = require('../config/db');
const moment = require('moment');

class Appointment {
  // Tạo lịch hẹn mới
  static async create(appointmentData) {
    try {
      const { 
        user_id, 
        service_id, 
        stylist_id, 
        appointment_date, 
        appointment_time, 
        notes = '',
        status = 'pending'
      } = appointmentData;
      
      const [result] = await db.execute(
        `INSERT INTO appointments 
        (user_id, service_id, stylist_id, appointment_date, appointment_time, notes, status, created_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
        [user_id, service_id, stylist_id, appointment_date, appointment_time, notes, status]
      );
      
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  // Lấy lịch hẹn theo ID
  static async findById(id) {
    try {
      const [rows] = await db.execute(
        `SELECT a.*, u.name as customer_name, u.phone as customer_phone,
         s.name as service_name, s.price as service_price,
         st.name as stylist_name
         FROM appointments a
         LEFT JOIN users u ON a.user_id = u.id
         LEFT JOIN services s ON a.service_id = s.id
         LEFT JOIN stylists st ON a.stylist_id = st.id
         WHERE a.id = ?`,
        [id]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Lấy lịch hẹn theo user_id
  static async findByUserId(userId) {
    try {
      const [rows] = await db.execute(
        `SELECT a.*, s.name as service_name, s.price as service_price,
         st.name as stylist_name
         FROM appointments a
         LEFT JOIN services s ON a.service_id = s.id
         LEFT JOIN stylists st ON a.stylist_id = st.id
         WHERE a.user_id = ?
         ORDER BY a.appointment_date DESC, a.appointment_time DESC`,
        [userId]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Lấy tất cả lịch hẹn
  static async findAll() {
    try {
      const [rows] = await db.execute(
        `SELECT a.*, u.name as customer_name, u.phone as customer_phone,
         s.name as service_name, s.price as service_price,
         st.name as stylist_name
         FROM appointments a
         LEFT JOIN users u ON a.user_id = u.id
         LEFT JOIN services s ON a.service_id = s.id
         LEFT JOIN stylists st ON a.stylist_id = st.id
         ORDER BY a.appointment_date DESC, a.appointment_time DESC`
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Lấy lịch hẹn theo ngày
  static async findByDate(date) {
    try {
      const [rows] = await db.execute(
        `SELECT a.*, u.name as customer_name, u.phone as customer_phone,
         s.name as service_name, s.price as service_price,
         st.name as stylist_name
         FROM appointments a
         LEFT JOIN users u ON a.user_id = u.id
         LEFT JOIN services s ON a.service_id = s.id
         LEFT JOIN stylists st ON a.stylist_id = st.id
         WHERE DATE(a.appointment_date) = ?
         ORDER BY a.appointment_time ASC`,
        [date]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Cập nhật trạng thái lịch hẹn
  static async updateStatus(id, status) {
    try {
      const [result] = await db.execute(
        'UPDATE appointments SET status = ?, updated_at = NOW() WHERE id = ?',
        [status, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Cập nhật lịch hẹn
  static async update(id, appointmentData) {
    try {
      const { 
        service_id, 
        stylist_id, 
        appointment_date, 
        appointment_time, 
        notes 
      } = appointmentData;
      
      const [result] = await db.execute(
        `UPDATE appointments 
         SET service_id = ?, stylist_id = ?, appointment_date = ?, 
             appointment_time = ?, notes = ?, updated_at = NOW()
         WHERE id = ?`,
        [service_id, stylist_id, appointment_date, appointment_time, notes, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Xóa lịch hẹn
  static async delete(id) {
    try {
      const [result] = await db.execute(
        'DELETE FROM appointments WHERE id = ?',
        [id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Kiểm tra xem stylist có lịch trống không
  static async checkStylistAvailability(stylistId, date, time) {
    try {
      const [rows] = await db.execute(
        `SELECT COUNT(*) as count FROM appointments 
         WHERE stylist_id = ? AND appointment_date = ? AND appointment_time = ? 
         AND status IN ('pending', 'confirmed')`,
        [stylistId, date, time]
      );
      return rows[0].count === 0;
    } catch (error) {
      throw error;
    }
  }

  // Lấy thống kê lịch hẹn
  static async getStats() {
    try {
      const [rows] = await db.execute(
        `SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
          SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed,
          SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
          SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled
         FROM appointments`
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Appointment;


