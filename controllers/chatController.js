const Chat = require('../models/chatModel');
const Contact = require('../models/contactModel');
const User = require('../models/userModel');

class ChatController {
    // Hiển thị trang chat cho customer
    static async getCustomerChat(req, res) {
        try {
            if (!req.session.user) {
                return res.redirect('/login');
            }

            const userId = req.session.user.id;
            const chats = await Chat.getUserChats(userId, 'customer');
            
            res.render('chat/customer', {
                title: 'Chat với Admin',
                user: req.session.user,
                chats
            });
        } catch (error) {
            console.error('❌ Error in getCustomerChat:', error);
            res.status(500).render('error', { 
                message: 'Có lỗi xảy ra khi tải trang chat',
                error: error 
            });
        }
    }

    // Hiển thị trang chat cho admin
    static async getAdminChat(req, res) {
        try {
            if (!req.session.user || req.session.user.role !== 'admin') {
                return res.redirect('/login');
            }

            const adminId = req.session.user.id;
            const chats = await Chat.getUserChats(adminId, 'admin');
            const contacts = await Contact.findAll();
            const unreadContacts = await Contact.getUnreadCount();
            
            res.render('chat/admin', {
                title: 'Tin nhắn & Chat',
                user: req.session.user,
                chats,
                contacts,
                unreadContacts
            });
        } catch (error) {
            console.error('❌ Error in getAdminChat:', error);
            res.status(500).render('error', { 
                message: 'Có lỗi xảy ra khi tải trang chat',
                error: error 
            });
        }
    }

    // API: Gửi tin nhắn
    static async sendMessage(req, res) {
        try {
            // Kiểm tra user đã đăng nhập chưa
            if (!req.session.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Vui lòng đăng nhập để gửi tin nhắn'
                });
            }

            const { receiver_id, receiver_type, message } = req.body;
            const sender_id = req.session.user.id;
            const sender_type = req.session.user.role === 'admin' ? 'admin' : 'customer';

            console.log('📝 Gửi tin nhắn:', {
                sender_id,
                sender_type,
                receiver_id,
                receiver_type,
                message
            });

            const messageId = await Chat.createMessage({
                sender_id,
                sender_type,
                receiver_id,
                receiver_type,
                message
            });

            console.log('✅ Tin nhắn đã được gửi với ID:', messageId);

            res.json({
                success: true,
                message: 'Tin nhắn đã được gửi',
                messageId
            });
        } catch (error) {
            console.error('❌ Error in sendMessage:', error);
            res.status(500).json({
                success: false,
                message: 'Có lỗi xảy ra khi gửi tin nhắn: ' + error.message
            });
        }
    }

    // API: Lấy tin nhắn giữa 2 user
    static async getMessages(req, res) {
        try {
            // Kiểm tra user đã đăng nhập chưa
            if (!req.session.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Vui lòng đăng nhập để xem tin nhắn'
                });
            }

            const { other_user_id, other_user_type } = req.params;
            const current_user_id = req.session.user.id;
            const current_user_type = req.session.user.role === 'admin' ? 'admin' : 'customer';

            console.log('📝 Lấy tin nhắn:', {
                current_user_id,
                current_user_type,
                other_user_id,
                other_user_type
            });

            const messages = await Chat.getMessages(
                current_user_id, 
                current_user_type, 
                other_user_id, 
                other_user_type
            );

            console.log('✅ Đã lấy được', messages.length, 'tin nhắn');

            res.json({
                success: true,
                messages
            });
        } catch (error) {
            console.error('❌ Error in getMessages:', error);
            res.status(500).json({
                success: false,
                message: 'Có lỗi xảy ra khi lấy tin nhắn'
            });
        }
    }

    // API: Lấy tin nhắn chưa đọc
    static async getUnreadMessages(req, res) {
        try {
            // Kiểm tra user đã đăng nhập chưa
            if (!req.session.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Vui lòng đăng nhập để xem tin nhắn chưa đọc'
                });
            }

            const userId = req.session.user.id;
            const userType = req.session.user.role === 'admin' ? 'admin' : 'customer';

            console.log('📝 Lấy tin nhắn chưa đọc cho:', { userId, userType });

            const messages = await Chat.getUnreadMessages(userId, userType);

            console.log('✅ Đã lấy được', messages.length, 'tin nhắn chưa đọc');

            res.json({
                success: true,
                messages
            });
        } catch (error) {
            console.error('❌ Error in getUnreadMessages:', error);
            res.status(500).json({
                success: false,
                message: 'Có lỗi xảy ra khi lấy tin nhắn chưa đọc'
            });
        }
    }

    // API: Đánh dấu tin nhắn đã đọc
    static async markAsRead(req, res) {
        try {
            const { messageId } = req.params;
            const success = await Chat.markAsRead(messageId);

            res.json({
                success: true,
                message: 'Đã đánh dấu tin nhắn đã đọc'
            });
        } catch (error) {
            console.error('❌ Error in markAsRead:', error);
            res.status(500).json({
                success: false,
                message: 'Có lỗi xảy ra khi đánh dấu tin nhắn'
            });
        }
    }

    // API: Lấy danh sách chat
    static async getChats(req, res) {
        try {
            // Kiểm tra user đã đăng nhập chưa
            if (!req.session.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Vui lòng đăng nhập để xem danh sách chat'
                });
            }

            const userId = req.session.user.id;
            const userType = req.session.user.role === 'admin' ? 'admin' : 'customer';

            console.log('📝 Lấy danh sách chat cho:', { userId, userType });

            const chats = await Chat.getUserChats(userId, userType);

            console.log('✅ Đã lấy được', chats.length, 'cuộc hội thoại');

            res.json({
                success: true,
                chats
            });
        } catch (error) {
            console.error('❌ Error in getChats:', error);
            res.status(500).json({
                success: false,
                message: 'Có lỗi xảy ra khi lấy danh sách chat'
            });
        }
    }
}

module.exports = ChatController;
