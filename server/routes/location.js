const express = require('express');
const Location = require('../models/Location');
const User = require('../models/User');
const Order = require('../models/Order');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Update location (delivery partner only)
router.post('/update', auth, authorize('delivery_partner'), async (req, res) => {
  try {
    const { latitude, longitude, accuracy, heading, speed, orderId } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    // Validate coordinates
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return res.status(400).json({
        success: false,
        message: 'Invalid coordinates'
      });
    }

    // Create location record
    const location = new Location({
      userId: req.user._id,
      orderId: orderId || null,
      latitude,
      longitude,
      accuracy,
      heading,
      speed,
      timestamp: new Date()
    });

    await location.save();

    // Update user's current location
    await User.findByIdAndUpdate(req.user._id, {
      currentLocation: {
        latitude,
        longitude,
        lastUpdated: new Date()
      }
    });

    // Emit real-time update via Socket.IO
    const io = req.app.get('io');
    if (io && orderId) {
      // Emit to order tracking room
      io.to(`order_${orderId}`).emit('location_update', {
        orderId,
        deliveryPartnerId: req.user._id,
        latitude,
        longitude,
        timestamp: new Date(),
        accuracy,
        heading,
        speed
      });

      // Get order to emit to vendor room
      const order = await Order.findById(orderId);
      if (order) {
        io.to(`vendor_${order.vendorId}`).emit('location_update', {
          orderId,
          deliveryPartnerId: req.user._id,
          latitude,
          longitude,
          timestamp: new Date()
        });
      }
    }

    res.json({
      success: true,
      data: location,
      message: 'Location updated successfully'
    });
  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during location update'
    });
  }
});

// Get current location of delivery partner
router.get('/current/:deliveryPartnerId', auth, async (req, res) => {
  try {
    const { deliveryPartnerId } = req.params;
    
    // Check permissions
    if (req.user.role === 'delivery_partner' && req.user._id.toString() !== deliveryPartnerId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const deliveryPartner = await User.findById(deliveryPartnerId)
      .select('name currentLocation isOnline');

    if (!deliveryPartner) {
      return res.status(404).json({
        success: false,
        message: 'Delivery partner not found'
      });
    }

    // For vendor, check if delivery partner belongs to them
    if (req.user.role === 'vendor') {
      const belongsToVendor = await User.findOne({
        _id: deliveryPartnerId,
        vendorId: req.user._id
      });

      if (!belongsToVendor) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    }

    res.json({
      success: true,
      data: deliveryPartner,
      message: 'Current location retrieved successfully'
    });
  } catch (error) {
    console.error('Get current location error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get location history for an order
router.get('/history/:orderId', auth, async (req, res) => {
  try {
    const { orderId } = req.params;
    
    // Check if user has access to this order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const hasAccess = 
      req.user.role === 'vendor' && order.vendorId.toString() === req.user._id.toString() ||
      req.user.role === 'delivery_partner' && order.deliveryPartnerId?.toString() === req.user._id.toString() ||
      req.user.role === 'customer' && order.customerId.toString() === req.user._id.toString();

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const locations = await Location.find({ orderId })
      .sort({ timestamp: 1 })
      .populate('userId', 'name');

    res.json({
      success: true,
      data: locations,
      message: 'Location history retrieved successfully'
    });
  } catch (error) {
    console.error('Get location history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get real-time location for order tracking (public with tracking ID)
router.get('/track/:trackingId', async (req, res) => {
  try {
    const { trackingId } = req.params;
    
    const order = await Order.findOne({ trackingId })
      .populate('deliveryPartnerId', 'name currentLocation vehicleType');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (!order.deliveryPartnerId) {
      return res.json({
        success: true,
        data: {
          status: order.status,
          message: 'Order not yet assigned to delivery partner'
        }
      });
    }

    // Get latest location
    const latestLocation = await Location.findOne({
      userId: order.deliveryPartnerId._id,
      orderId: order._id
    }).sort({ timestamp: -1 });

    res.json({
      success: true,
      data: {
        order: {
          _id: order._id,
          trackingId: order.trackingId,
          status: order.status,
          pickupAddress: order.pickupAddress,
          deliveryAddress: order.deliveryAddress,
          estimatedDeliveryTime: order.estimatedDeliveryTime
        },
        deliveryPartner: {
          name: order.deliveryPartnerId.name,
          vehicleType: order.deliveryPartnerId.vehicleType,
          currentLocation: order.deliveryPartnerId.currentLocation
        },
        latestLocation
      },
      message: 'Tracking information retrieved successfully'
    });
  } catch (error) {
    console.error('Track location error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Toggle delivery partner online status
router.put('/toggle-online', auth, authorize('delivery_partner'), async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.isOnline = !user.isOnline;
    
    if (!user.isOnline) {
      // Clear current location when going offline
      user.currentLocation = undefined;
    }
    
    await user.save();

    res.json({
      success: true,
      data: { isOnline: user.isOnline },
      message: `Status updated to ${user.isOnline ? 'online' : 'offline'}`
    });
  } catch (error) {
    console.error('Toggle online status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Set delivery partner online status
router.put('/status', auth, authorize('delivery_partner'), async (req, res) => {
  try {
    const { isOnline } = req.body;
    
    if (typeof isOnline !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isOnline must be a boolean value'
      });
    }

    const user = await User.findById(req.user._id);
    user.isOnline = isOnline;
    
    if (!user.isOnline) {
      // Clear current location when going offline
      user.currentLocation = undefined;
    }
    
    await user.save();

    res.json({
      success: true,
      data: { isOnline: user.isOnline },
      message: `Status updated to ${user.isOnline ? 'online' : 'offline'}`
    });
  } catch (error) {
    console.error('Set online status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
