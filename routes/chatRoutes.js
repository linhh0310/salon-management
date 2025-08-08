const express = require('express');
const router = express.Router();
const ChatController = require('../controllers/chatController');
const Contact = require('../models/contactModel');
const db = require('../config/db');

// Trang chat cho customer
router.get('/customer', ChatController.getCustomerChat);

// Trang chat cho admin
router.get('/admin', ChatController.getAdminChat);

// API routes
router.post('/send', ChatController.sendMessage);
router.get('/messages/:other_user_id/:other_user_type', ChatController.getMessages);
router.get('/unread', ChatController.getUnreadMessages);
router.put('/read/:messageId', ChatController.markAsRead);
router.get('/chats', ChatController.getChats);

// Get admin ID
router.get('/admin-id', async (req, res) => {
    try {
        const [admins] = await db.execute('SELECT id FROM users WHERE role = "admin" LIMIT 1');
        
        if (admins.length > 0) {
            res.json({
                success: true,
                adminId: admins[0].id
            });
        } else {
            res.json({
                success: false,
                message: 'Không tìm thấy admin'
            });
        }
    } catch (error) {
        console.error('❌ Error getting admin ID:', error);
        res.status(500).json({ success: false, message: 'Có lỗi xảy ra khi lấy admin ID' });
    }
});

// Contact routes
router.get('/contacts', async (req, res) => {
    try {
        const contacts = await Contact.findAll();
        const unreadCount = await Contact.getUnreadCount();
        
        res.json({
            success: true,
            contacts,
            unreadCount
        });
    } catch (error) {
        console.error('❌ Error getting contacts:', error);
        res.status(500).json({ success: false, message: 'Có lỗi xảy ra khi lấy danh sách tin nhắn' });
    }
});

router.put('/contact/:id/read', async (req, res) => {
    try {
        const { id } = req.params;
        const success = await Contact.markAsRead(id);
        
        if (success) {
            res.json({ success: true, message: 'Đã đánh dấu đã đọc' });
        } else {
            res.status(404).json({ success: false, message: 'Không tìm thấy tin nhắn' });
        }
    } catch (error) {
        console.error('❌ Error marking contact as read:', error);
        res.status(500).json({ success: false, message: 'Có lỗi xảy ra' });
    }
});

module.exports = router;
