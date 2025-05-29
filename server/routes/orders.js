const express = require('express');
const Order = require('../models/Order');
const User = require('../models/User');
const { auth, authorize, checkVendorAccess } = require('../middleware/auth');

const router = express.Router();

// Create a new order (vendor only)
router.post('/', auth, authorize('vendor'), async (req, res) => {
  try {
    const {
      customerName,
      customerPhone,
      pickupAddress,
      deliveryAddress,
      pickupLocation,
      deliveryLocation,
      items,
      totalAmount
    } = req.body;

    // Create customer if not exists
    let customer = await User.findOne({ email: `${customerPhone}@customer.temp` });
    if (!customer) {
      customer = new User({
        email: `${customerPhone}@customer.temp`,
        password: 'temp123456', // Temporary password
        name: customerName,
        role: 'customer'
      });
      await customer.save();
    }

    const order = new Order({
      vendorId: req.user._id,
      customerId: customer._id,
      customerName,
      customerPhone,
      pickupAddress,
      deliveryAddress,
      pickupLocation,
      deliveryLocation,
      items,
      totalAmount
    });

    await order.save();

    const populatedOrder = await Order.findById(order._id)
      .populate('vendorId', 'name businessName')
      .populate('customerId', 'name');

    res.status(201).json({
      success: true,
      data: populatedOrder,
      message: 'Order created successfully'
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during order creation'
    });
  }
});

// Get orders for vendor/delivery partner
router.get('/', auth, checkVendorAccess, async (req, res) => {
  try {
    let query = {};
    
    if (req.user.role === 'vendor') {
      query.vendorId = req.user._id;
    } else if (req.user.role === 'delivery_partner') {
      query.deliveryPartnerId = req.user._id;
    }

    const { status, page = 1, limit = 10 } = req.query;
    
    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('vendorId', 'name businessName')
      .populate('deliveryPartnerId', 'name vehicleType')
      .populate('customerId', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      },
      message: 'Orders retrieved successfully'
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get single order by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('vendorId', 'name businessName')
      .populate('deliveryPartnerId', 'name vehicleType currentLocation')
      .populate('customerId', 'name');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check access permissions
    const hasAccess = 
      req.user.role === 'vendor' && order.vendorId._id.toString() === req.user._id.toString() ||
      req.user.role === 'delivery_partner' && order.deliveryPartnerId?._id.toString() === req.user._id.toString() ||
      req.user.role === 'customer' && order.customerId._id.toString() === req.user._id.toString();

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: order,
      message: 'Order retrieved successfully'
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Assign delivery partner to order (vendor only)
router.put('/:id/assign', auth, authorize('vendor'), async (req, res) => {
  try {
    const { deliveryPartnerId } = req.body;
    
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if vendor owns this order
    if (order.vendorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if delivery partner exists and belongs to this vendor
    const deliveryPartner = await User.findOne({
      _id: deliveryPartnerId,
      role: 'delivery_partner',
      vendorId: req.user._id,
      isActive: true
    });

    if (!deliveryPartner) {
      return res.status(400).json({
        success: false,
        message: 'Invalid delivery partner'
      });
    }

    order.deliveryPartnerId = deliveryPartnerId;
    order.status = 'assigned';
    await order.save();

    const updatedOrder = await Order.findById(order._id)
      .populate('vendorId', 'name businessName')
      .populate('deliveryPartnerId', 'name vehicleType')
      .populate('customerId', 'name');

    // Emit socket event for real-time update
    const io = req.app.get('io');
    if (io) {
      io.to(`delivery_partner_${deliveryPartnerId}`).emit('order_assigned', {
        order: updatedOrder,
        message: 'New order assigned to you'
      });
    }

    res.json({
      success: true,
      data: updatedOrder,
      message: 'Delivery partner assigned successfully'
    });
  } catch (error) {
    console.error('Assign delivery partner error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Update order status (delivery partner only)
router.put('/:id/status', auth, authorize('delivery_partner'), async (req, res) => {
  try {
    const { status } = req.body;
    
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if delivery partner is assigned to this order
    if (order.deliveryPartnerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const validStatuses = ['picked_up', 'in_transit', 'delivered'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    order.status = status;
    if (status === 'delivered') {
      order.actualDeliveryTime = new Date();
    }
    await order.save();

    const updatedOrder = await Order.findById(order._id)
      .populate('vendorId', 'name businessName')
      .populate('deliveryPartnerId', 'name vehicleType currentLocation')
      .populate('customerId', 'name');

    // Emit socket event for real-time update
    const io = req.app.get('io');
    if (io) {
      io.to(`order_${order._id}`).emit('order_status_updated', {
        orderId: order._id,
        status,
        timestamp: new Date(),
        location: req.user.currentLocation
      });

      io.to(`vendor_${order.vendorId}`).emit('order_status_updated', {
        orderId: order._id,
        status,
        timestamp: new Date()
      });
    }

    res.json({
      success: true,
      data: updatedOrder,
      message: 'Order status updated successfully'
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Track order by tracking ID (public endpoint)
router.get('/track/:trackingId', async (req, res) => {
  try {
    const order = await Order.findOne({ trackingId: req.params.trackingId })
      .populate('vendorId', 'name businessName')
      .populate('deliveryPartnerId', 'name vehicleType currentLocation')
      .select('-customerId'); // Don't expose customer details

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: order,
      message: 'Order tracking information retrieved successfully'
    });
  } catch (error) {
    console.error('Track order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get delivery partners available for assignment
router.get('/delivery-partners', auth, checkVendorAccess, async (req, res) => {
  try {
    const deliveryPartners = await User.find({
      role: 'delivery_partner',
      isActive: true
    }).select('name vehicleType licenseNumber isOnline');

    res.json({
      success: true,
      data: deliveryPartners
    });
  } catch (error) {
    console.error('Get delivery partners error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get orders assigned to delivery partner
router.get('/my-orders', auth, authorize('delivery_partner'), async (req, res) => {
  try {
    const orders = await Order.find({
      deliveryPartnerId: req.user.id
    })
      .populate('vendorId', 'name businessName businessAddress businessPhone')
      .populate('customerId', 'name')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error('Get my orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
