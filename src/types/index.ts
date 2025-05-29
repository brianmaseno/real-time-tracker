export interface User {
  _id: string;
  email: string;
  password: string;
  name: string;
  phone?: string;
  role: 'vendor' | 'delivery_partner' | 'customer';
  vendorId?: string; // For delivery partners assigned to a vendor
  isActive: boolean;
  isOnline?: boolean; // For delivery partners
  vehicleType?: 'bike' | 'car' | 'bicycle'; // For delivery partners
  licenseNumber?: string; // For delivery partners
  businessName?: string; // For vendors
  businessAddress?: string; // For vendors
  businessPhone?: string; // For vendors
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  _id: string;
  vendorId: string;
  customerId: string;
  deliveryPartnerId?: string;
  customerName: string;
  customerPhone: string;
  pickupAddress: string;
  deliveryAddress: string;
  items?: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  amount?: number; // Order amount
  totalAmount?: number;
  description?: string;
  status: 'pending' | 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled';
  estimatedDeliveryTime?: Date;
  assignedTo?: User; // Populated delivery partner
  customer?: User; // Populated customer
  vendor?: User; // Populated vendor
  createdAt: Date;
  updatedAt: Date;
}

export interface Location {
  _id: string;
  userId: string; // delivery partner ID
  orderId?: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  heading?: number;
  speed?: number;
  timestamp: Date;
  isActive: boolean;
}

export interface DeliveryPartner extends User {
  role: 'delivery_partner';
  vendorId: string;
  vehicleType: 'bike' | 'car' | 'bicycle';
  licenseNumber?: string;
  isOnline: boolean;
  currentLocation?: {
    latitude: number;
    longitude: number;
    lastUpdated: Date;
  };
}

export interface Vendor extends User {
  role: 'vendor';
  businessName: string;
  businessAddress: string;
  businessPhone: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

// Socket.IO event types
export interface LocationUpdate {
  orderId: string;
  deliveryPartnerId: string;
  latitude: number;
  longitude: number;
  timestamp: Date;
}

export interface OrderStatusUpdate {
  orderId: string;
  status: Order['status'];
  timestamp: Date;
  location?: {
    latitude: number;
    longitude: number;
  };
}

// Frontend specific types
export interface MapProps {
  center: [number, number];
  zoom: number;
  markers?: Array<{
    id: string;
    position: [number, number];
    popup?: string;
    icon?: string;
  }>;
  polyline?: Array<[number, number]>;
}

export interface DashboardStats {
  totalOrders: number;
  activeOrders: number;
  completedOrders: number;
  activeDeliveryPartners: number;
}
