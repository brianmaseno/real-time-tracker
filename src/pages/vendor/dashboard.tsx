import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../../components/Layout';
import { ApiResponse, Order, User } from '../../types';
import { api } from '../../utils/api';
import { socketManager } from '../../utils/socket';

const VendorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [deliveryPartners, setDeliveryPartners] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (user && user.role === 'vendor') {
      fetchOrders();
      fetchDeliveryPartners();
      setupSocketListeners();
    }
  }, [user]);
  const fetchOrders = async () => {
    try {
      const response: ApiResponse<Order[]> = await api.get('/api/orders');
      if (response.success && response.data) {
        setOrders(response.data);
      }
    } catch (err) {
      setError('Failed to fetch orders');
    }
  };

  const fetchDeliveryPartners = async () => {
    try {
      const response: ApiResponse<User[]> = await api.get('/api/orders/delivery-partners');
      if (response.success && response.data) {
        setDeliveryPartners(response.data);
      }
    } catch (err) {
      setError('Failed to fetch delivery partners');
    } finally {
      setLoading(false);
    }
  };

  const setupSocketListeners = () => {
    if (user) {
      socketManager.connect();
      socketManager.joinRoom({ userId: user._id, role: 'vendor' });

      socketManager.on('order_status_updated', (data) => {
        setOrders(prev => prev.map(order => 
          order._id === data.orderId 
            ? { ...order, status: data.status }
            : order
        ));
      });

      socketManager.on('delivery_partner_status_update', (data) => {
        setDeliveryPartners(prev => prev.map(partner =>
          partner._id === data.deliveryPartnerId
            ? { ...partner, isOnline: data.isOnline }
            : partner
        ));
      });
    }
  };

  const handleAssignOrder = async (orderId: string, deliveryPartnerId: string) => {
    try {
      const response: ApiResponse<Order> = await api.put(`/api/orders/${orderId}/assign`, {
        deliveryPartnerId
      });
        if (response.success) {
        setOrders(prev => prev.map(order =>
          order._id === orderId
            ? { ...order, deliveryPartnerId: deliveryPartnerId, status: 'assigned' as const }
            : order
        ));
      }
    } catch (err) {
      setError('Failed to assign order');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'assigned':
        return 'bg-blue-100 text-blue-800';
      case 'picked_up':
        return 'bg-purple-100 text-purple-800';
      case 'in_transit':
        return 'bg-indigo-100 text-indigo-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  const assignDeliveryPartner = async (orderId: string, deliveryPartnerId: string) => {
    try {
      const response: ApiResponse<Order> = await api.put(`/api/orders/${orderId}/assign`, {
        deliveryPartnerId
      });
        if (response.success && response.data) {
        setOrders(prev => prev.map(order => 
          order._id === orderId ? response.data! : order
        ));
      }
    } catch (err) {
      setError('Failed to assign delivery partner');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Vendor Dashboard</h1>
          <p className="mt-2 text-gray-600">Manage your orders and delivery partners</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Orders Section */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Orders</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {orders.length === 0 ? (
                  <div className="px-6 py-8 text-center text-gray-500">
                    No orders found
                  </div>
                ) : (
                  orders.map((order) => (
                    <div key={order._id} className="px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="text-lg font-medium text-gray-900">
                              Order #{order._id.slice(-6)}
                            </h3>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                              {order.status.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>
                          <div className="mt-2 text-sm text-gray-600">                            <p><strong>Customer:</strong> {order.customer?.name || order.customerName}</p>
                            <p><strong>Pickup:</strong> {order.pickupAddress}</p>
                            <p><strong>Delivery:</strong> {order.deliveryAddress}</p>
                            <p><strong>Amount:</strong> ₹{order.amount || order.totalAmount || 0}</p>
                          </div>
                        </div>
                        
                        {order.status === 'pending' && (
                          <div className="ml-4">
                            <select
                              onChange={(e) => handleAssignOrder(order._id, e.target.value)}
                              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                              defaultValue=""
                            >
                              <option value="" disabled>Assign to...</option>
                              {deliveryPartners
                                .filter(partner => partner.isOnline)
                                .map(partner => (
                                  <option key={partner._id} value={partner._id}>
                                    {partner.name} ({partner.vehicleType})
                                  </option>
                                ))}
                            </select>
                          </div>
                        )}
                          {order.deliveryPartnerId && (
                          <div className="ml-4 text-sm text-gray-600">
                            <p><strong>Assigned to:</strong></p>
                            <p>{deliveryPartners.find(p => p._id === order.deliveryPartnerId)?.name || 'Unknown'}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Delivery Partners Section */}
          <div>
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Delivery Partners</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {deliveryPartners.length === 0 ? (
                  <div className="px-6 py-8 text-center text-gray-500">
                    No delivery partners found
                  </div>
                ) : (
                  deliveryPartners.map((partner) => (
                    <div key={partner._id} className="px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">{partner.name}</h3>
                          <p className="text-sm text-gray-600">{partner.vehicleType}</p>
                          <p className="text-sm text-gray-600">{partner.licenseNumber}</p>
                        </div>
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full ${partner.isOnline ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                          <span className="ml-2 text-sm text-gray-600">
                            {partner.isOnline ? 'Online' : 'Offline'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="mt-6 bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Quick Stats</h2>
              </div>
              <div className="px-6 py-4 space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Orders</span>
                  <span className="text-sm font-medium">{orders.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Pending Orders</span>
                  <span className="text-sm font-medium">
                    {orders.filter(o => o.status === 'pending').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Active Deliveries</span>
                  <span className="text-sm font-medium">
                    {orders.filter(o => ['assigned', 'picked_up', 'in_transit'].includes(o.status)).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Online Partners</span>
                  <span className="text-sm font-medium">
                    {deliveryPartners.filter(p => p.isOnline).length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default VendorDashboard;
