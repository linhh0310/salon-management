const Product = require('../models/productModel');

class ProductController {
    // Hiển thị trang danh sách sản phẩm
    static async getProducts(req, res) {
        try {
            const products = await Product.findAll();
            
            // Parse features từ JSON string thành array
            const productsWithParsedFeatures = products.map(product => ({
                ...product,
                features: product.features ? JSON.parse(product.features) : []
            }));

            res.render('products', { 
                products: productsWithParsedFeatures,
                user: req.session.user 
            });
        } catch (error) {
            console.error('Error getting products:', error);
            res.status(500).render('error', { 
                message: 'Lỗi khi tải danh sách sản phẩm',
                user: req.session.user 
            });
        }
    }

    // Hiển thị trang chi tiết sản phẩm
    static async getProductDetail(req, res) {
        try {
            const productId = req.params.id;
            const product = await Product.findById(productId);
            
            if (!product) {
                return             res.status(404).render('error', { 
                message: 'Không tìm thấy sản phẩm',
                user: req.session.user 
            });
            }

            // Parse features từ JSON string thành array
            product.features = product.features ? JSON.parse(product.features) : [];

            res.render('productDetail', { 
                product,
                user: req.session.user 
            });
        } catch (error) {
            console.error('Error getting product detail:', error);
            res.status(500).render('error', { 
                message: 'Lỗi khi tải chi tiết sản phẩm',
                user: req.session.user 
            });
        }
    }

    // Tìm kiếm sản phẩm
    static async searchProducts(req, res) {
        try {
            const searchTerm = req.query.q;
            if (!searchTerm) {
                return res.redirect('/products');
            }

            const products = await Product.search(searchTerm);
            
            // Parse features từ JSON string thành array
            const productsWithParsedFeatures = products.map(product => ({
                ...product,
                features: product.features ? JSON.parse(product.features) : []
            }));

            res.render('products', { 
                products: productsWithParsedFeatures,
                searchTerm,
                user: req.session.user 
            });
        } catch (error) {
            console.error('Error searching products:', error);
            res.status(500).render('error', { 
                message: 'Lỗi khi tìm kiếm sản phẩm',
                user: req.session.user 
            });
        }
    }

    // Lọc sản phẩm theo danh mục
    static async getProductsByCategory(req, res) {
        try {
            const category = req.params.category;
            const products = await Product.findByCategory(category);
            
            // Parse features từ JSON string thành array
            const productsWithParsedFeatures = products.map(product => ({
                ...product,
                features: product.features ? JSON.parse(product.features) : []
            }));

            res.render('products', { 
                products: productsWithParsedFeatures,
                category,
                user: req.session.user 
            });
        } catch (error) {
            console.error('Error getting products by category:', error);
            res.status(500).render('error', { 
                message: 'Lỗi khi lọc sản phẩm theo danh mục',
                user: req.session.user 
            });
        }
    }

    // Lấy sản phẩm bán chạy
    static async getBestSellingProducts(req, res) {
        try {
            const products = await Product.getBestSelling();
            res.render('bestSellingProducts', { 
                products,
                user: req.session.user || null,
                title: 'Sản phẩm bán chạy'
            });
        } catch (error) {
            console.error('Error getting best selling products:', error);
            res.status(500).render('error', { 
                message: 'Lỗi khi tải sản phẩm bán chạy',
                user: req.session.user || null
            });
        }
    }

    // API: Lấy tất cả sản phẩm (cho AJAX)
    static async apiGetProducts(req, res) {
        try {
            const products = await Product.findAll();
            
            // Parse features từ JSON string thành array
            const productsWithParsedFeatures = products.map(product => ({
                ...product,
                features: product.features ? JSON.parse(product.features) : []
            }));

            res.json({ success: true, products: productsWithParsedFeatures });
        } catch (error) {
            console.error('Error in API getting products:', error);
            res.status(500).json({ success: false, message: 'Lỗi khi tải danh sách sản phẩm' });
        }
    }

    // API: Lấy sản phẩm theo ID (cho AJAX)
    static async apiGetProductById(req, res) {
        try {
            const productId = req.params.id;
            const product = await Product.findById(productId);
            
            if (!product) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
            }

            // Parse features từ JSON string thành array
            product.features = product.features ? JSON.parse(product.features) : [];

            res.json({ success: true, product });
        } catch (error) {
            console.error('Error in API getting product by ID:', error);
            res.status(500).json({ success: false, message: 'Lỗi khi tải thông tin sản phẩm' });
        }
    }

    // API: Cập nhật số lượng sản phẩm
    static async apiUpdateQuantity(req, res) {
        try {
            const { productId, quantity } = req.body;
            
            if (!productId || quantity === undefined) {
                return res.status(400).json({ success: false, message: 'Thiếu thông tin sản phẩm hoặc số lượng' });
            }

            const success = await Product.updateQuantity(productId, quantity);
            
            if (success) {
                res.json({ success: true, message: 'Cập nhật số lượng thành công' });
            } else {
                res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
            }
        } catch (error) {
            console.error('Error updating product quantity:', error);
            res.status(500).json({ success: false, message: 'Lỗi khi cập nhật số lượng sản phẩm' });
        }
    }

    // API: Giảm số lượng sản phẩm (khi bán)
    static async apiDecreaseQuantity(req, res) {
        try {
            const { productId, amount } = req.body;
            
            if (!productId || !amount) {
                return res.status(400).json({ success: false, message: 'Thiếu thông tin sản phẩm hoặc số lượng' });
            }

            const success = await Product.decreaseQuantity(productId, amount);
            
            if (success) {
                // Cập nhật số lượng bán ra
                await Product.updateSalesCount(productId, amount);
                res.json({ success: true, message: 'Giảm số lượng thành công' });
            } else {
                res.status(400).json({ success: false, message: 'Số lượng không đủ hoặc không tìm thấy sản phẩm' });
            }
        } catch (error) {
            console.error('Error decreasing product quantity:', error);
            res.status(500).json({ success: false, message: 'Lỗi khi giảm số lượng sản phẩm' });
        }
    }

    // API: Tăng số lượng sản phẩm (khi nhập hàng)
    static async apiIncreaseQuantity(req, res) {
        try {
            const { productId, amount } = req.body;
            
            if (!productId || !amount) {
                return res.status(400).json({ success: false, message: 'Thiếu thông tin sản phẩm hoặc số lượng' });
            }

            const success = await Product.increaseQuantity(productId, amount);
            
            if (success) {
                res.json({ success: true, message: 'Tăng số lượng thành công' });
            } else {
                res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
            }
        } catch (error) {
            console.error('Error increasing product quantity:', error);
            res.status(500).json({ success: false, message: 'Lỗi khi tăng số lượng sản phẩm' });
        }
    }

    // API lấy sản phẩm bán chạy
    static async apiGetBestSellingProducts(req, res) {
        try {
            const products = await Product.getBestSelling();
            res.json({ success: true, products });
        } catch (error) {
            console.error('Error getting best selling products:', error);
            res.status(500).json({ success: false, message: 'Lỗi khi tải sản phẩm bán chạy' });
        }
    }
}

module.exports = ProductController; 