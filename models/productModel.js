const db = require('../config/db');

class Product {
  // Lấy tất cả sản phẩm
  static async findAll() {
    try {
      const [rows] = await db.execute(`
        SELECT * FROM products 
        ORDER BY created_at DESC
      `);
      return rows;
    } catch (error) {
      console.error('Error in Product.findAll:', error);
      throw error;
    }
  }

  // Lấy sản phẩm theo ID
  static async findById(id) {
    try {
      const [rows] = await db.execute(`
        SELECT * FROM products 
        WHERE id = ?
      `, [id]);
      return rows[0];
    } catch (error) {
      console.error('Error in Product.findById:', error);
      throw error;
    }
  }

  // Lấy sản phẩm theo danh mục
  static async findByCategory(categoryId) {
    try {
      const [rows] = await db.execute(`
        SELECT * FROM products 
        WHERE category_id = ? AND is_active = 1
        ORDER BY created_at DESC
      `, [categoryId]);
      return rows;
    } catch (error) {
      console.error('Error in Product.findByCategory:', error);
      throw error;
    }
  }

  // Tạo sản phẩm mới
  static async create(productData) {
    try {
      const { name, description, price, quantity, image } = productData;
      
      const [result] = await db.execute(`
        INSERT INTO products (name, description, price, quantity, image, created_at) 
        VALUES (?, ?, ?, ?, ?, NOW())
      `, [name, description, price, quantity, image]);
      
      return result.insertId;
    } catch (error) {
      console.error('Error in Product.create:', error);
      throw error;
    }
  }

  // Cập nhật sản phẩm
  static async update(id, productData) {
    try {
      const { name, description, price, quantity, image } = productData;
      
      const [result] = await db.execute(`
        UPDATE products 
        SET name = ?, description = ?, price = ?, quantity = ?, 
            image = ?, updated_at = NOW()
        WHERE id = ?
      `, [name, description, price, quantity, image, id]);
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error in Product.update:', error);
      throw error;
    }
  }

  // Xóa sản phẩm
  static async delete(id) {
    try {
      const [result] = await db.execute('DELETE FROM products WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error in Product.delete:', error);
      throw error;
    }
  }

  // Đếm tổng số sản phẩm
  static async count() {
    try {
      const [rows] = await db.execute('SELECT COUNT(*) as total FROM products');
      return rows[0].total;
    } catch (error) {
      console.error('Error in Product.count:', error);
      throw error;
    }
  }

  // Lấy sản phẩm bán chạy
  static async getBestSelling() {
    try {
      const [rows] = await db.execute(`
        SELECT * FROM products 
        ORDER BY quantity DESC
        LIMIT 10
      `);
      return rows;
    } catch (error) {
      console.error('Error in Product.getBestSelling:', error);
      throw error;
    }
  }

  // Tìm kiếm sản phẩm
  static async search(keyword) {
    try {
      const [rows] = await db.execute(`
        SELECT * FROM products 
        WHERE (name LIKE ? OR description LIKE ?)
        ORDER BY created_at DESC
      `, [`%${keyword}%`, `%${keyword}%`]);
      return rows;
    } catch (error) {
      console.error('Error in Product.search:', error);
      throw error;
    }
  }

  // Cập nhật số lượng tồn kho
  static async updateQuantity(id, quantity) {
    try {
      const [result] = await db.execute(`
        UPDATE products 
        SET quantity = ?, updated_at = NOW()
        WHERE id = ?
      `, [quantity, id]);
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error in Product.updateQuantity:', error);
      throw error;
    }
  }

  // Toggle trạng thái active
  static async toggleStatus(id) {
    try {
      const [result] = await db.execute(`
        UPDATE products 
        SET status = CASE WHEN status = 'active' THEN 'inactive' ELSE 'active' END, updated_at = NOW()
        WHERE id = ?
      `, [id]);
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error in Product.toggleStatus:', error);
      throw error;
    }
  }

  // Giảm số lượng sản phẩm
  static async decreaseQuantity(id, amount) {
    try {
      const [result] = await db.execute(`
        UPDATE products 
        SET quantity = quantity - ?, updated_at = NOW()
        WHERE id = ? AND quantity >= ?
      `, [amount, id, amount]);
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error in Product.decreaseQuantity:', error);
      throw error;
    }
  }

  // Tăng số lượng sản phẩm
  static async increaseQuantity(id, amount) {
    try {
      const [result] = await db.execute(`
        UPDATE products 
        SET quantity = quantity + ?, updated_at = NOW()
        WHERE id = ?
      `, [amount, id]);
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error in Product.increaseQuantity:', error);
      throw error;
    }
  }

  // Cập nhật số lượng bán ra
  static async updateSalesCount(id, amount) {
    try {
      const [result] = await db.execute(`
        UPDATE products 
        SET sales_count = COALESCE(sales_count, 0) + ?, updated_at = NOW()
        WHERE id = ?
      `, [amount, id]);
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error in Product.updateSalesCount:', error);
      throw error;
    }
  }
}

module.exports = Product; 