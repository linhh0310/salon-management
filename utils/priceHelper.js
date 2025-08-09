// Server-side helper function để format giá tiền theo định dạng VNĐ
function formatPrice(price) {
    if (!price) return '₫ 0';
    
    // Convert to number and format with explicit thousands separator
    const num = parseFloat(price);
    if (isNaN(num)) return '₫ 0';
    
    // Format with Vietnamese locale and ensure dot separator
    const formatted = num.toLocaleString('vi-VN', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });
    
    // Replace comma with dot for thousands separator
    return '₫ ' + formatted.replace(/,/g, '.');
}

module.exports = { formatPrice };

