const db = require('../config/db');

class Chat {
    // Tạo tin nhắn mới
    static async createMessage(messageData) {
        try {
            const { sender_id, sender_type, receiver_id, receiver_type, message, message_type = 'text' } = messageData;
            
            const [result] = await db.execute(
                'INSERT INTO chat_messages (sender_id, sender_type, receiver_id, receiver_type, message, message_type, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
                [sender_id, sender_type, receiver_id, receiver_type, message, message_type]
            );
            
            return result.insertId;
        } catch (error) {
            console.error('❌ Lỗi khi tạo tin nhắn:', error);
            throw error;
        }
    }

    // Lấy tin nhắn giữa 2 user
    static async getMessages(user1Id, user1Type, user2Id, user2Type) {
        try {
            const [rows] = await db.execute(
                `SELECT * FROM chat_messages 
                WHERE (sender_id = ? AND sender_type = ? AND receiver_id = ? AND receiver_type = ?)
                OR (sender_id = ? AND sender_type = ? AND receiver_id = ? AND receiver_type = ?)
                ORDER BY created_at ASC`,
                [user1Id, user1Type, user2Id, user2Type, user2Id, user2Type, user1Id, user1Type]
            );
            return rows;
        } catch (error) {
            throw error;
        }
    }

    // Lấy tin nhắn chưa đọc
    static async getUnreadMessages(userId, userType) {
        try {
            const [rows] = await db.execute(
                'SELECT * FROM chat_messages WHERE receiver_id = ? AND receiver_type = ? AND is_read = 0 ORDER BY created_at DESC',
                [userId, userType]
            );
            return rows;
        } catch (error) {
            throw error;
        }
    }

    // Đánh dấu tin nhắn đã đọc
    static async markAsRead(messageId) {
        try {
            const [result] = await db.execute(
                'UPDATE chat_messages SET is_read = 1 WHERE id = ?',
                [messageId]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    // Lấy danh sách chat của user
    static async getUserChats(userId, userType) {
        try {
            const [rows] = await db.execute(
                `SELECT 
                    other_user_id,
                    other_user_type,
                    last_message_time,
                    unread_count,
                    last_message
                FROM (
                    SELECT DISTINCT 
                        CASE 
                            WHEN sender_id = ? AND sender_type = ? THEN receiver_id
                            ELSE sender_id
                        END as other_user_id,
                        CASE 
                            WHEN sender_id = ? AND sender_type = ? THEN receiver_type
                            ELSE sender_type
                        END as other_user_type,
                        MAX(created_at) as last_message_time,
                        COUNT(CASE WHEN is_read = 0 AND receiver_id = ? AND receiver_type = ? THEN 1 END) as unread_count,
                        SUBSTRING_INDEX(GROUP_CONCAT(message ORDER BY created_at DESC), ',', 1) as last_message
                    FROM chat_messages 
                    WHERE (sender_id = ? AND sender_type = ?) OR (receiver_id = ? AND receiver_type = ?)
                    GROUP BY other_user_id, other_user_type
                ) as chat_summary
                ORDER BY last_message_time DESC`,
                [userId, userType, userId, userType, userId, userType, userId, userType, userId, userType]
            );
            return rows;
        } catch (error) {
            console.error('❌ Lỗi trong getUserChats:', error);
            throw error;
        }
    }
}

module.exports = Chat;
