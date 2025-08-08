// Cart Manager - Quản lý giỏ hàng tập trung
class CartManager {
    constructor() {
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

    // Khởi tạo
    init() {
        this.loadUserCart();
        this.updateCartCount();
    }

    // Load giỏ hàng của user
    loadUserCart() {
        if (this.currentUser.id) {
            const userCart = localStorage.getItem('userCart_' + this.currentUser.id);
            if (userCart) {
                localStorage.setItem('cart', userCart);
            }
        }
    }

    // Lưu giỏ hàng cho user
    saveUserCart() {
        if (this.currentUser.id) {
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            localStorage.setItem('userCart_' + this.currentUser.id, JSON.stringify(cart));
        }
    }

    // Cập nhật số lượng giỏ hàng
    updateCartCount() {
        const cartCount = document.getElementById('header-cart-count');
        if (cartCount) {
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
            cartCount.textContent = totalItems;
        }
    }

    // Thêm sản phẩm vào giỏ hàng
    addToCart(productId, productName, productPrice, productImage) {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        
        const existingItem = cart.find(item => item.id === productId);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id: productId,
                name: productName,
                price: productPrice,
                image: productImage,
                quantity: 1
            });
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        this.saveUserCart();
        this.updateCartCount();
        
        return cart;
    }

    // Cập nhật số lượng sản phẩm
    updateQuantity(productId, change) {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const item = cart.find(item => item.id === productId);
        
        if (item) {
            item.quantity += change;
            if (item.quantity <= 0) {
                this.removeFromCart(productId);
            } else {
                localStorage.setItem('cart', JSON.stringify(cart));
                this.saveUserCart();
                this.updateCartCount();
            }
        }
        
        return cart;
    }

    // Cập nhật số lượng trực tiếp
    updateQuantityDirect(productId, newQuantity) {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const item = cart.find(item => item.id === productId);
        
        if (item) {
            item.quantity = parseInt(newQuantity) || 1;
            if (item.quantity <= 0) {
                this.removeFromCart(productId);
            } else {
                localStorage.setItem('cart', JSON.stringify(cart));
                this.saveUserCart();
                this.updateCartCount();
            }
        }
        
        return cart;
    }

    // Xóa sản phẩm khỏi giỏ hàng
    removeFromCart(productId) {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        cart = cart.filter(item => item.id !== productId);
        localStorage.setItem('cart', JSON.stringify(cart));
        this.saveUserCart();
        this.updateCartCount();
        
        return cart;
    }

    // Xóa toàn bộ giỏ hàng
    clearCart() {
        localStorage.removeItem('cart');
        this.saveUserCart();
        this.updateCartCount();
    }

    // Lấy giỏ hàng hiện tại
    getCart() {
        return JSON.parse(localStorage.getItem('cart')) || [];
    }

    // Xử lý khi đăng nhập thành công
    handleLoginSuccess(userData) {
        // Kiểm tra xem có phải user khác không
        const lastUserId = localStorage.getItem('lastUserId');
        
        if (lastUserId && lastUserId !== userData.id.toString()) {
            // Nếu đăng nhập user khác, reset toàn bộ dữ liệu
            console.log('🔄 Đăng nhập user khác, reset toàn bộ dữ liệu...');
            
            // Xóa toàn bộ localStorage (trừ một số key cần thiết)
            this.clearAllData();
        }
        
        // Lưu thông tin user mới
        localStorage.setItem('currentUser', JSON.stringify({
            id: userData.id,
            name: userData.name,
            email: userData.email,
            role: userData.role
        }));

        this.currentUser = userData;
        
        // Load giỏ hàng của user mới nếu có
        const userCart = localStorage.getItem('userCart_' + userData.id);
        if (userCart) {
            localStorage.setItem('cart', userCart);
        }
        
        // Cập nhật thông tin tracking
        localStorage.setItem('lastUserId', userData.id.toString());
        localStorage.setItem('lastUserCart', JSON.stringify(this.getCart()));
        
        // Cập nhật hiển thị
        this.updateCartCount();
        
        console.log('✅ Đã reset toàn bộ dữ liệu cho user mới:', userData.name);
    }

    // Xử lý khi đăng ký thành công (user mới)
    handleRegisterSuccess(userData) {
        // Reset toàn bộ dữ liệu cho user mới
        console.log('🔄 Đăng ký user mới, reset toàn bộ dữ liệu...');
        
        // Xóa toàn bộ localStorage (trừ một số key cần thiết)
        this.clearAllData();
        
        // Lưu thông tin user mới
        localStorage.setItem('currentUser', JSON.stringify({
            id: userData.id,
            name: userData.name,
            email: userData.email,
            role: userData.role
        }));

        this.currentUser = userData;
        
        // Cập nhật thông tin tracking
        localStorage.setItem('lastUserId', userData.id.toString());
        localStorage.setItem('lastUserCart', '[]');
        
        // Cập nhật hiển thị
        this.updateCartCount();
        
        console.log('✅ Đã reset toàn bộ dữ liệu cho user mới:', userData.name);
    }

    // Xóa tất cả giỏ hàng của user khác
    clearAllUserCarts() {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith('userCart_')) {
                localStorage.removeItem(key);
            }
        });
        console.log('🧹 Đã xóa tất cả giỏ hàng của user khác');
    }

    // Xóa toàn bộ dữ liệu localStorage (trừ một số key cần thiết)
    clearAllData() {
        const keysToKeep = [
            'userCart_' + this.currentUser.id, // Giữ giỏ hàng của user hiện tại nếu có
            'currentUser', // Giữ thông tin user hiện tại
            'lastUserId', // Giữ tracking
            'lastUserCart' // Giữ tracking
        ];
        
        const allKeys = Object.keys(localStorage);
        allKeys.forEach(key => {
            if (!keysToKeep.includes(key)) {
                localStorage.removeItem(key);
            }
        });
        
        console.log('🧹 Đã xóa toàn bộ dữ liệu localStorage');
        console.log('📋 Các key được giữ lại:', keysToKeep);
    }

    // Xử lý khi đăng xuất
    handleLogout() {
        // Lưu giỏ hàng hiện tại cho user
        const currentCart = this.getCart();
        if (this.currentUser.id && currentCart.length > 0) {
            localStorage.setItem('userCart_' + this.currentUser.id, JSON.stringify(currentCart));
        }
        
        // Xóa thông tin user hiện tại
        localStorage.removeItem('currentUser');
        localStorage.removeItem('lastUserId');
        localStorage.removeItem('lastUserCart');
        
        // Xóa giỏ hàng hiện tại
        this.clearCart();
        
        this.currentUser = {};
    }

    // Hiển thị thông báo
    showMessage(message, type = 'success') {
        const messageDiv = document.createElement('div');
        messageDiv.style.cssText = 
            'position: fixed;' +
            'top: 20px;' +
            'right: 20px;' +
            'background: ' + (type === 'success' ? '#28a745' : '#dc3545') + ';' +
            'color: white;' +
            'padding: 15px 20px;' +
            'border-radius: 8px;' +
            'font-weight: 500;' +
            'z-index: 3000;' +
            'animation: slideIn 0.3s ease-out;';
        messageDiv.textContent = message;
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            messageDiv.remove();
        }, 3000);
    }
}

// Khởi tạo Cart Manager khi trang được tải
document.addEventListener('DOMContentLoaded', function() {
    window.cartManager = new CartManager();
});

// Export cho sử dụng global
window.CartManager = CartManager;

