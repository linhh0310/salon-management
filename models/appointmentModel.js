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
        `SELECT a.*, u.name as customer_name, u.phone as customer_phone, u.email as customer_email,
         s.name as service_name, s.price as service_price, s.duration as service_duration,
         st.name as stylist_name, st.phone as stylist_phone
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

  // Lấy tất cả lịch hẹn với thông tin chi tiết
  static async findAll() {
    try {
      const [rows] = await db.execute(
        `SELECT a.*, u.name as customer_name, u.phone as customer_phone, u.email as customer_email,
         s.name as service_name, s.price as service_price, s.duration as service_duration,
         st.name as stylist_name, st.phone as stylist_phone
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

  // Lấy lịch hẹn theo stylist và ngày
  static async findByStylistAndDate(stylistId, date) {
    try {
      const [rows] = await db.execute(
        `SELECT a.*, u.name as customer_name, u.phone as customer_phone,
         s.name as service_name, s.price as service_price
         FROM appointments a
         LEFT JOIN users u ON a.user_id = u.id
         LEFT JOIN services s ON a.service_id = s.id
         WHERE a.stylist_id = ? AND DATE(a.appointment_date) = ?
         ORDER BY a.appointment_time ASC`,
        [stylistId, date]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Kiểm tra stylist có lịch trống không
  static async checkStylistAvailability(stylistId, date, time) {
    try {
      const [rows] = await db.execute(
        `SELECT COUNT(*) as count FROM appointments 
         WHERE stylist_id = ? AND appointment_date = ? AND appointment_time = ? AND status != 'cancelled'`,
        [stylistId, date, time]
      );
      return rows[0].count === 0;
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
        notes,
        status
      } = appointmentData;
      
      const [result] = await db.execute(
        `UPDATE appointments 
         SET service_id = ?, stylist_id = ?, appointment_date = ?, 
             appointment_time = ?, notes = ?, status = ?, updated_at = NOW()
         WHERE id = ?`,
        [service_id, stylist_id, appointment_date, appointment_time, notes, status, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Cập nhật trạng thái lịch hẹn
  static async updateStatus(id, status) {
    try {
      const [result] = await db.execute(
        `UPDATE appointments SET status = ?, updated_at = NOW() WHERE id = ?`,
        [status, id]
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
        `DELETE FROM appointments WHERE id = ?`,
        [id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Lấy thống kê appointments
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

  // Lấy appointments theo trạng thái
  static async findByStatus(status) {
    try {
      const [rows] = await db.execute(
        `SELECT a.*, u.name as customer_name, u.phone as customer_phone,
         s.name as service_name, s.price as service_price,
         st.name as stylist_name
         FROM appointments a
         LEFT JOIN users u ON a.user_id = u.id
         LEFT JOIN services s ON a.service_id = s.id
         LEFT JOIN stylists st ON a.stylist_id = st.id
         WHERE a.status = ?
         ORDER BY a.appointment_date DESC, a.appointment_time DESC`,
        [status]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Tìm kiếm appointments
  static async search(searchTerm) {
    try {
      const [rows] = await db.execute(
        `SELECT a.*, u.name as customer_name, u.phone as customer_phone,
         s.name as service_name, s.price as service_price,
         st.name as stylist_name
         FROM appointments a
         LEFT JOIN users u ON a.user_id = u.id
         LEFT JOIN services s ON a.service_id = s.id
         LEFT JOIN stylists st ON a.stylist_id = st.id
         WHERE u.name LIKE ? OR s.name LIKE ? OR st.name LIKE ? OR a.notes LIKE ?
         ORDER BY a.appointment_date DESC, a.appointment_time DESC`,
        [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Lấy appointments trong khoảng thời gian
  static async findByDateRange(fromDate, toDate) {
    try {
      const [rows] = await db.execute(
        `SELECT a.*, u.name as customer_name, u.phone as customer_phone,
         s.name as service_name, s.price as service_price,
         st.name as stylist_name
         FROM appointments a
         LEFT JOIN users u ON a.user_id = u.id
         LEFT JOIN services s ON a.service_id = s.id
         LEFT JOIN stylists st ON a.stylist_id = st.id
         WHERE a.appointment_date BETWEEN ? AND ?
         ORDER BY a.appointment_date ASC, a.appointment_time ASC`,
        [fromDate, toDate]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Lấy appointments hôm nay
  static async getTodayAppointments() {
    try {
      const today = new Date().toISOString().split('T')[0];
      return await this.findByDate(today);
    } catch (error) {
      throw error;
    }
  }

  // Lấy appointments tuần này
  static async getThisWeekAppointments() {
    try {
      const startOfWeek = moment().startOf('week').format('YYYY-MM-DD');
      const endOfWeek = moment().endOf('week').format('YYYY-MM-DD');
      return await this.findByDateRange(startOfWeek, endOfWeek);
    } catch (error) {
      throw error;
    }
  }

  // Lấy appointments tháng này
  static async getThisMonthAppointments() {
    try {
      const startOfMonth = moment().startOf('month').format('YYYY-MM-DD');
      const endOfMonth = moment().endOf('month').format('YYYY-MM-DD');
      return await this.findByDateRange(startOfMonth, endOfMonth);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Appointment;


