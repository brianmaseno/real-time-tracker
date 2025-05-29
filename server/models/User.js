const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['vendor', 'delivery_partner', 'customer'],
    required: true
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() {
      return this.role === 'delivery_partner';
    }
  },
  businessName: {
    type: String,
    required: function() {
      return this.role === 'vendor';
    }
  },
  businessAddress: {
    type: String,
    required: function() {
      return this.role === 'vendor';
    }
  },
  businessPhone: {
    type: String,
    required: function() {
      return this.role === 'vendor';
    }
  },
  vehicleType: {
    type: String,
    enum: ['bike', 'car', 'bicycle'],
    required: function() {
      return this.role === 'delivery_partner';
    }
  },
  licenseNumber: {
    type: String,
    required: function() {
      return this.role === 'delivery_partner' && this.vehicleType !== 'bicycle';
    }
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  currentLocation: {
    latitude: Number,
    longitude: Number,
    lastUpdated: Date
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Don't return password in JSON
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model('User', userSchema);
