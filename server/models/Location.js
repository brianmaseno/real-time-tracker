const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  latitude: {
    type: Number,
    required: true,
    min: -90,
    max: 90
  },
  longitude: {
    type: Number,
    required: true,
    min: -180,
    max: 180
  },
  accuracy: {
    type: Number,
    min: 0
  },
  heading: {
    type: Number,
    min: 0,
    max: 360
  },
  speed: {
    type: Number,
    min: 0
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
locationSchema.index({ userId: 1, timestamp: -1 });
locationSchema.index({ orderId: 1, timestamp: -1 });
locationSchema.index({ isActive: 1, timestamp: -1 });

module.exports = mongoose.model('Location', locationSchema);
