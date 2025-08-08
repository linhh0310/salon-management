// Chat Widget - Widget chat cho website
class ChatWidget {
    constructor() {
        this.isOpen = false;
        this.currentUser = this.getCurrentUser();
        this.init();
    }

    // Lấy thông tin user hiện tại
    getCurrentUser() {
        try {
            return JSON.parse(localStorage.getItem('currentUser') || '{}');
        } catch (e) {
            return {};
        }
    }

    // Khởi tạo widget
    init() {
        this.createWidget();
        this.bindEvents();
        this.loadAdminId();
        this.loadMessages();
        this.loadUnreadCount();
        
        // Auto refresh tin nhắn mỗi 5 giây
        setInterval(() => {
            this.loadMessages();
            this.loadUnreadCount();
        }, 5000);
    }

    // Tạo widget HTML
    createWidget() {
        const widgetHTML = `
            <div id="chat-widget" class="chat-widget">
                <div class="chat-widget-button" id="chatWidgetButton">
                    <i class="fas fa-comments"></i>
                    <span class="chat-notification" id="chatNotification" style="display: none;">0</span>
                </div>
                
                <div class="chat-widget-container" id="chatWidgetContainer" style="display: none;">
                    <div class="chat-widget-header">
                        <h3><i class="fas fa-headset"></i> Hỗ trợ trực tuyến</h3>
                        <button class="chat-close-btn" id="chatCloseBtn">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="chat-widget-messages" id="chatWidgetMessages">
                        <div class="chat-welcome">
                            <i class="fas fa-comments"></i>
                            <p>Chào bạn! Tôi có thể giúp gì cho bạn?</p>
                        </div>
                    </div>
                    
                    <div class="chat-widget-input">
                        <input type="text" id="chatMessageInput" placeholder="Nhập tin nhắn..." maxlength="500">
                        <button id="chatSendBtn">
                            <i class="fas fa-paper-plane"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Thêm CSS
        const style = document.createElement('style');
        style.textContent = `
            .chat-widget {
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 1000;
                font-family: Arial, sans-serif;
            }
            
            .chat-widget-button {
                width: 60px;
                height: 60px;
                background: #007bff;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 24px;
                cursor: pointer;
                box-shadow: 0 4px 12px rgba(0,123,255,0.3);
                transition: all 0.3s;
                position: relative;
            }
            
            .chat-widget-button:hover {
                background: #0056b3;
                transform: scale(1.1);
            }
            
            .chat-notification {
                position: absolute;
                top: -5px;
                right: -5px;
                background: #dc3545;
                color: white;
                border-radius: 50%;
                width: 20px;
                height: 20px;
                font-size: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
            }
            
            .chat-widget-container {
                position: absolute;
                bottom: 80px;
                right: 0;
                width: 350px;
                height: 400px;
                background: white;
                border-radius: 15px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                display: flex;
                flex-direction: column;
                overflow: hidden;
            }
            
            .chat-widget-header {
                background: #007bff;
                color: white;
                padding: 15px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .chat-widget-header h3 {
                margin: 0;
                font-size: 16px;
            }
            
            .chat-close-btn {
                background: none;
                border: none;
                color: white;
                font-size: 18px;
                cursor: pointer;
                padding: 5px;
            }
            
            .chat-widget-messages {
                flex: 1;
                padding: 15px;
                overflow-y: auto;
                background: #f8f9fa;
            }
            
            .chat-welcome {
                text-align: center;
                color: #666;
                padding: 20px;
            }
            
            .chat-welcome i {
                font-size: 3rem;
                color: #ccc;
                margin-bottom: 10px;
            }
            
            .chat-message {
                margin-bottom: 10px;
                display: flex;
                align-items: flex-start;
            }
            
            .chat-message.sent {
                justify-content: flex-end;
            }
            
            .chat-message.received {
                justify-content: flex-start;
            }
            
            .chat-message-content {
                max-width: 80%;
                padding: 8px 12px;
                border-radius: 15px;
                word-wrap: break-word;
                font-size: 14px;
            }
            
            .chat-message.sent .chat-message-content {
                background: #007bff;
                color: white;
            }
            
            .chat-message.received .chat-message-content {
                background: white;
                color: #333;
                border: 1px solid #e9ecef;
            }
            
            .chat-widget-input {
                padding: 15px;
                background: white;
                border-top: 1px solid #e9ecef;
                display: flex;
                gap: 10px;
            }
            
            .chat-widget-input input {
                flex: 1;
                padding: 8px 12px;
                border: 1px solid #ddd;
                border-radius: 20px;
                outline: none;
                font-size: 14px;
            }
            
            .chat-widget-input input:focus {
                border-color: #007bff;
            }
            
            .chat-widget-input button {
                padding: 8px 12px;
                background: #007bff;
                color: white;
                border: none;
                border-radius: 20px;
                cursor: pointer;
                font-size: 14px;
            }
            
            .chat-widget-input button:hover {
                background: #0056b3;
            }
            
            @media (max-width: 480px) {
                .chat-widget-container {
                    width: 300px;
                    height: 350px;
                }
            }
        `;
        document.head.appendChild(style);

        // Thêm widget vào body
        document.body.insertAdjacentHTML('beforeend', widgetHTML);
    }

    // Bind events
    bindEvents() {
        const button = document.getElementById('chatWidgetButton');
        const container = document.getElementById('chatWidgetContainer');
        const closeBtn = document.getElementById('chatCloseBtn');
        const sendBtn = document.getElementById('chatSendBtn');
        const input = document.getElementById('chatMessageInput');

        button.addEventListener('click', () => this.toggleWidget());
        closeBtn.addEventListener('click', () => this.closeWidget());
        sendBtn.addEventListener('click', () => this.sendMessage());
        
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });
    }

    // Toggle widget
    toggleWidget() {
        const container = document.getElementById('chatWidgetContainer');
        this.isOpen = !this.isOpen;
        
        if (this.isOpen) {
            container.style.display = 'flex';
            this.loadMessages();
        } else {
            container.style.display = 'none';
        }
    }

    // Đóng widget
    closeWidget() {
        this.isOpen = false;
        document.getElementById('chatWidgetContainer').style.display = 'none';
    }

    // Gửi tin nhắn
    sendMessage() {
        const input = document.getElementById('chatMessageInput');
        const message = input.value.trim();
        
        if (!message) return;
        
        // Kiểm tra user đã đăng nhập chưa
        if (!this.currentUser.id) {
            this.showLoginPrompt();
            return;
        }

        // Lấy admin ID từ session hoặc sử dụng ID 1 làm mặc định
        const adminId = window.adminId || 1;

        fetch('/chat/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                receiver_id: adminId,
                receiver_type: 'admin',
                message: message
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                input.value = '';
                this.loadMessages();
            } else {
                console.error('Server error:', data.message);
                alert('Có lỗi xảy ra khi gửi tin nhắn: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Có lỗi xảy ra khi gửi tin nhắn. Vui lòng thử lại.');
        });
    }

    // Load tin nhắn
    loadMessages() {
        if (!this.currentUser.id) {
            return;
        }

        const adminId = window.adminId || 1;
        
        fetch(`/chat/messages/${adminId}/admin`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                this.displayMessages(data.messages);
            }
        })
        .catch(error => {
            console.error('Error loading messages:', error);
        });
    }

    // Hiển thị tin nhắn
    displayMessages(messages) {
        const messagesContainer = document.getElementById('chatWidgetMessages');
        
        if (messages.length === 0) {
            messagesContainer.innerHTML = `
                <div class="chat-welcome">
                    <i class="fas fa-comments"></i>
                    <p>Chào bạn! Tôi có thể giúp gì cho bạn?</p>
                </div>
            `;
            return;
        }
        
        messagesContainer.innerHTML = '';
        
        messages.forEach(message => {
            const messageDiv = document.createElement('div');
            messageDiv.className = `chat-message ${message.sender_type === 'customer' ? 'sent' : 'received'}`;
            
            const messageContent = document.createElement('div');
            messageContent.className = 'chat-message-content';
            messageContent.textContent = message.message;
            
            messageDiv.appendChild(messageContent);
            messagesContainer.appendChild(messageDiv);
        });
        
        // Scroll xuống tin nhắn mới nhất
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Load admin ID
    loadAdminId() {
        fetch('/chat/admin-id')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                window.adminId = data.adminId;
                console.log('✅ Admin ID loaded:', data.adminId);
            } else {
                console.log('⚠️ Using default admin ID: 1');
                window.adminId = 1;
            }
        })
        .catch(error => {
            console.error('Error loading admin ID:', error);
            window.adminId = 1;
        });
    }

    // Load số tin nhắn chưa đọc
    loadUnreadCount() {
        if (!this.currentUser.id) {
            this.hideNotification();
            return;
        }
        
        fetch('/chat/unread')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.success && data.messages.length > 0) {
                this.showNotification(data.messages.length);
            } else {
                this.hideNotification();
            }
        })
        .catch(error => {
            console.error('Error loading unread count:', error);
            this.hideNotification();
        });
    }

    // Hiển thị notification
    showNotification(count) {
        const notification = document.getElementById('chatNotification');
        notification.textContent = count;
        notification.style.display = 'flex';
    }

    // Ẩn notification
    hideNotification() {
        document.getElementById('chatNotification').style.display = 'none';
    }

    // Hiển thị prompt đăng nhập
    showLoginPrompt() {
        const messagesContainer = document.getElementById('chatWidgetMessages');
        messagesContainer.innerHTML = `
            <div class="chat-welcome">
                <i class="fas fa-user-lock"></i>
                <p>Vui lòng đăng nhập để chat với admin</p>
                <button onclick="window.location.href='/login'" style="margin-top: 10px; padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    Đăng nhập
                </button>
            </div>
        `;
    }

    // Cập nhật user khi đăng nhập
    updateUser(userData) {
        this.currentUser = userData;
        this.loadUnreadCount();
    }
}

// Khởi tạo Chat Widget khi trang được tải
document.addEventListener('DOMContentLoaded', function() {
    window.chatWidget = new ChatWidget();
});

// Export cho sử dụng global
window.ChatWidget = ChatWidget;
