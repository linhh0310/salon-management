const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const flash = require('connect-flash');
const path = require('path');
const net = require('net');
const multer = require('multer');
require('dotenv').config();

const app = express();

// Cấu hình view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Cấu hình multer cho upload file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/employees/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'employee-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ cho phép upload file ảnh!'), false);
    }
  }
});

// Middleware upload cho employee routes
app.use('/admin/employees/add', upload.single('photo'));
app.use('/admin/employees/*/edit', upload.single('photo'));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'salonSecret',
  resave: true,
  saveUninitialized: true,
  cookie: {
    secure: false, // Set to true if using HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Flash messages
app.use(flash());

// Global variables for templates
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success');
  res.locals.error_msg = req.flash('error');
  res.locals.user = req.session.user || null;
  res.locals.currentUser = req.session.user || null;
  next();
});

// Kết nối Database
const db = require('./config/db');

// Import Routes
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const productRoutes = require('./routes/productRoutes');
const chatRoutes = require('./routes/chatRoutes');

// Sử dụng Routes
app.use('/', userRoutes);
app.use('/admin', adminRoutes);
app.use('/products', productRoutes);
app.use('/chat', chatRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).render('error', {
    message: 'Trang không tồn tại',
    error: { status: 404 }
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', {
    message: 'Có lỗi xảy ra',
    error: err
  });
});

const PORT = process.env.PORT || 3000;

// Hàm kiểm tra port có sẵn không
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.once('close', () => {
        resolve(true);
      });
      server.close();
    });
    server.on('error', () => {
      resolve(false);
    });
  });
}

// Hàm khởi động server với retry
async function startServer() {
  const maxRetries = 5;
  let retries = 0;
  
  while (retries < maxRetries) {
    const portAvailable = await isPortAvailable(PORT);
    
    if (portAvailable) {
      try {
        app.listen(PORT, () => {
          console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
          console.log(`📱 Môi trường: ${process.env.NODE_ENV || 'development'}`);
          console.log(`✅ Kết nối MySQL thành công!`);
        });
        return;
      } catch (error) {
        console.error(`❌ Lỗi khởi động server: ${error.message}`);
        retries++;
        if (retries < maxRetries) {
          console.log(`🔄 Thử lại lần ${retries + 1}/${maxRetries} sau 2 giây...`);
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    } else {
      console.log(`⚠️ Port ${PORT} đang được sử dụng. Thử lại sau 2 giây...`);
      retries++;
      if (retries < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }
  
  console.error(`❌ Không thể khởi động server sau ${maxRetries} lần thử.`);
  console.log(`💡 Hãy thử:`);
  console.log(`   1. Chạy file start-server.bat hoặc start-server.ps1`);
  console.log(`   2. Hoặc chạy lệnh: taskkill /f /im node.exe && node app.js`);
  process.exit(1);
}

// Khởi động server
startServer();
