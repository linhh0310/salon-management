const db = require('../config/db');

class Review {
  // Lấy tất cả đánh giá
  static async findAll() {
    try {
      const [rows] = await db.execute(`
        SELECT r.*, u.name as customer_name, s.name as service_name, st.name as stylist_name
        FROM reviews r 
        LEFT JOIN users u ON r.user_id = u.id 
        LEFT JOIN services s ON r.service_id = s.id 
        LEFT JOIN stylists st ON r.stylist_id = st.id 
        ORDER BY r.created_at DESC
      `);
      return rows;
    } catch (error) {
      console.error('Error in Review.findAll:', error);
      throw error;
    }
  }

  // Lấy đánh giá theo ID
  static async findById(id) {
    try {
      const [rows] = await db.execute(`
        SELECT r.*, u.name as customer_name, s.name as service_name, st.name as stylist_name
        FROM reviews r 
        LEFT JOIN users u ON r.user_id = u.id 
        LEFT JOIN services s ON r.service_id = s.id 
        LEFT JOIN stylists st ON r.stylist_id = st.id 
        WHERE r.id = ?
      `, [id]);
      return rows[0];
    } catch (error) {
      console.error('Error in Review.findById:', error);
      throw error;
    }
  }

  // Tạo đánh giá mới
  static async create(reviewData) {
    try {
      const { user_id, service_id, stylist_id, rating, comment } = reviewData;
      
      const [result] = await db.execute(`
        INSERT INTO reviews (user_id, service_id, stylist_id, rating, comment, created_at) 
        VALUES (?, ?, ?, ?, ?, NOW())
      `, [user_id, service_id, stylist_id, rating, comment]);
      
      return result.insertId;
    } catch (error) {
      console.error('Error in Review.create:', error);
      throw error;
    }
  }

  // Cập nhật đánh giá
  static async update(id, reviewData) {
    try {
      const { rating, comment } = reviewData;
      
      const [result] = await db.execute(`
        UPDATE reviews 
        SET rating = ?, comment = ?, updated_at = NOW()
        WHERE id = ?
      `, [rating, comment, id]);
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error in Review.update:', error);
      throw error;
    }
  }

  // Xóa đánh giá
  static async delete(id) {
    try {
      const [result] = await db.execute('DELETE FROM reviews WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error in Review.delete:', error);
      throw error;
    }
  }

  // Đếm tổng số đánh giá
  static async count() {
    try {
      const [rows] = await db.execute('SELECT COUNT(*) as total FROM reviews');
      return rows[0].total;
    } catch (error) {
      console.error('Error in Review.count:', error);
      throw error;
    }
  }

  // Lấy đánh giá theo service
  static async findByService(serviceId) {
    try {
      const [rows] = await db.execute(`
        SELECT r.*, u.name as customer_name, s.name as service_name, st.name as stylist_name
        FROM reviews r 
        LEFT JOIN users u ON r.user_id = u.id 
        LEFT JOIN services s ON r.service_id = s.id 
        LEFT JOIN stylists st ON r.stylist_id = st.id 
        WHERE r.service_id = ? AND r.is_active = 1
        ORDER BY r.created_at DESC
      `, [serviceId]);
      return rows;
    } catch (error) {
      console.error('Error in Review.findByService:', error);
      throw error;
    }
  }

  // Lấy đánh giá theo stylist
  static async findByStylist(stylistId) {
    try {
      const [rows] = await db.execute(`
        SELECT r.*, u.name as customer_name, s.name as service_name, st.name as stylist_name
        FROM reviews r 
        LEFT JOIN users u ON r.user_id = u.id 
        LEFT JOIN services s ON r.service_id = s.id 
        LEFT JOIN stylists st ON r.stylist_id = st.id 
        WHERE r.stylist_id = ? AND r.is_active = 1
        ORDER BY r.created_at DESC
      `, [stylistId]);
      return rows;
    } catch (error) {
      console.error('Error in Review.findByStylist:', error);
      throw error;
    }
  }

  // Tính điểm trung bình
  static async getAverageRating() {
    try {
      const [rows] = await db.execute('SELECT AVG(rating) as average FROM reviews WHERE is_active = 1');
      return rows[0].average || 0;
    } catch (error) {
      console.error('Error in Review.getAverageRating:', error);
      throw error;
    }
  }

  // Toggle trạng thái active
  static async toggleStatus(id) {
    try {
      const [result] = await db.execute(`
        UPDATE reviews 
        SET is_active = NOT is_active, updated_at = NOW()
        WHERE id = ?
      `, [id]);
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error in Review.toggleStatus:', error);
      throw error;
    }
  }
}

module.exports = Review; 