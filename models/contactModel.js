const db = require('../config/db');

class Contact {
    // Tạo tin nhắn contact mới
    static async create(contactData) {
        try {
            const { name, email, phone, message } = contactData;
            
            const [result] = await db.execute(
                'INSERT INTO contacts (name, email, phone, message, created_at) VALUES (?, ?, ?, ?, NOW())',
                [name, email, phone, message]
            );
            
            return result.insertId;
        } catch (error) {
            console.error('❌ Lỗi khi tạo contact:', error);
            throw error;
        }
    }

    // Lấy tất cả tin nhắn contact
    static async findAll() {
        try {
            const [rows] = await db.execute(
                'SELECT * FROM contacts ORDER BY created_at DESC'
            );
            return rows;
        } catch (error) {
            throw error;
        }
    }

    // Lấy tin nhắn contact theo ID
    static async findById(id) {
        try {
            const [rows] = await db.execute(
                'SELECT * FROM contacts WHERE id = ?',
                [id]
            );
            return rows[0];
        } catch (error) {
            throw error;
        }
    }

    // Đánh dấu tin nhắn đã đọc
    static async markAsRead(id) {
        try {
            const [result] = await db.execute(
                'UPDATE contacts SET is_read = 1 WHERE id = ?',
                [id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    // Lấy số tin nhắn chưa đọc
    static async getUnreadCount() {
        try {
            const [rows] = await db.execute(
                'SELECT COUNT(*) as count FROM contacts WHERE is_read = 0'
            );
            return rows[0].count;
        } catch (error) {
            throw error;
        }
    }

    // Xóa tin nhắn contact
    static async delete(id) {
        try {
            const [result] = await db.execute(
                'DELETE FROM contacts WHERE id = ?',
                [id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Contact; 