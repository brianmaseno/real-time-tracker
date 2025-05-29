require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');

// Import routes
const authRoutes = require('./routes/auth');
const orderRoutes = require('./routes/orders');
const locationRoutes = require('./routes/location');

// Initialize Express app
const app = express();
const server = createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }
});

// Store io instance in app for use in routes
app.set('io', io);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Database connection
mongoose.connect(process.env.MONGODB_URI)
.then(() => {
  console.log('Connected to MongoDB');
})
.catch((error) => {
  console.error('MongoDB connection error:', error);
  process.exit(1);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/location', locationRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Join rooms based on user role and ID
  socket.on('join_room', (data) => {
    const { userId, role, orderId } = data;
    
    // Join user-specific room
    if (role === 'vendor') {
      socket.join(`vendor_${userId}`);
      console.log(`Vendor ${userId} joined room`);
    } else if (role === 'delivery_partner') {
      socket.join(`delivery_partner_${userId}`);
      console.log(`Delivery partner ${userId} joined room`);
    }
    
    // Join order tracking room if orderId provided
    if (orderId) {
      socket.join(`order_${orderId}`);
      console.log(`User joined order tracking room: ${orderId}`);
    }
  });

  // Handle location updates from delivery partners
  socket.on('location_update', (data) => {
    const { orderId, latitude, longitude, timestamp } = data;
    
    // Broadcast to order tracking room
    socket.to(`order_${orderId}`).emit('location_update', {
      orderId,
      latitude,
      longitude,
      timestamp
    });
    
    console.log(`Location update for order ${orderId}: ${latitude}, ${longitude}`);
  });

  // Handle order status updates
  socket.on('order_status_update', (data) => {
    const { orderId, status, vendorId } = data;
    
    // Broadcast to order tracking room and vendor room
    socket.to(`order_${orderId}`).emit('order_status_updated', data);
    if (vendorId) {
      socket.to(`vendor_${vendorId}`).emit('order_status_updated', data);
    }
    
    console.log(`Order status update for ${orderId}: ${status}`);
  });

  // Handle delivery partner going online/offline
  socket.on('delivery_partner_status', (data) => {
    const { userId, isOnline, vendorId } = data;
    
    // Notify vendor about delivery partner status
    if (vendorId) {
      socket.to(`vendor_${vendorId}`).emit('delivery_partner_status_update', {
        deliveryPartnerId: userId,
        isOnline
      });
    }
    
    console.log(`Delivery partner ${userId} is now ${isOnline ? 'online' : 'offline'}`);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });

  // Handle errors
  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`MongoDB URI: ${process.env.MONGODB_URI ? 'Connected' : 'Not configured'}`);
});
