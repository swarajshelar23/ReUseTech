const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const messageRoutes = require('./routes/messageRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const errorHandler = require('./middleware/errorHandler');

// Initialize Express app
const app = express();

/**
 * Middleware Configuration
 */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../client')));

/**
 * Database Connection
 */
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ MongoDB Connected Successfully');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

connectDB();

/**
 * API Routes
 */
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

/**
 * Frontend Routes
 * Serve HTML pages
 */
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/register.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dashboard.html'));
});

app.get('/add-product', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/add-product.html'));
});

app.get('/product/:id', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/product-details.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/admin.html'));
});

app.get('/messages', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/messages.html'));
});

/**
 * Error Handler Middleware (must be last)
 */
app.use(errorHandler);

/**
 * Start Server
 */
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use. Please close the existing process and try again.`);
    console.error(`   Run: netstat -ano | findstr :${PORT}  then  taskkill /PID <pid> /F`);
    process.exit(1);
  } else {
    throw err;
  }
});

module.exports = app;
