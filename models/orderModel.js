const db = require('../config/db');

class Order {
  // Lấy tất cả đơn hàng
  static async findAll() {
    try {
      const [rows] = await db.execute(`
        SELECT o.*, u.name as customer_name 
        FROM orders o 
        LEFT JOIN users u ON o.user_id = u.id 
        ORDER BY o.created_at DESC
      `);
      return rows;
    } catch (error) {
      console.error('Error in Order.findAll:', error);
      throw error;
    }
  }

  // Lấy đơn hàng theo ID
  static async findById(id) {
    try {
      const [rows] = await db.execute(`
        SELECT o.*, u.name as customer_name 
        FROM orders o 
        LEFT JOIN users u ON o.user_id = u.id 
        WHERE o.id = ?
      `, [id]);
      return rows[0];
    } catch (error) {
      console.error('Error in Order.findById:', error);
      throw error;
    }
  }

  // Tạo đơn hàng mới
  static async create(orderData) {
    try {
      const { user_id, total_amount, shipping_address, payment_method, notes } = orderData;
      
      const [result] = await db.execute(`
        INSERT INTO orders (user_id, total_amount, shipping_address, payment_method, notes, created_at) 
        VALUES (?, ?, ?, ?, ?, NOW())
      `, [user_id, total_amount, shipping_address, payment_method, notes]);
      
      return result.insertId;
    } catch (error) {
      console.error('Error in Order.create:', error);
      throw error;
    }
  }

  // Cập nhật trạng thái đơn hàng
  static async updateStatus(id, status) {
    try {
      const [result] = await db.execute(`
        UPDATE orders 
        SET status = ?, updated_at = NOW()
        WHERE id = ?
      `, [status, id]);
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error in Order.updateStatus:', error);
      throw error;
    }
  }

  // Đếm tổng số đơn hàng
  static async count() {
    try {
      const [rows] = await db.execute('SELECT COUNT(*) as total FROM orders');
      return rows[0].total;
    } catch (error) {
      console.error('Error in Order.count:', error);
      throw error;
    }
  }

  // Lấy đơn hàng theo trạng thái
  static async findByStatus(status) {
    try {
      const [rows] = await db.execute(`
        SELECT o.*, u.name as customer_name 
        FROM orders o 
        LEFT JOIN users u ON o.user_id = u.id 
        WHERE o.status = ?
        ORDER BY o.created_at DESC
      `, [status]);
      return rows;
    } catch (error) {
      console.error('Error in Order.findByStatus:', error);
      throw error;
    }
  }
}

module.exports = Order; 