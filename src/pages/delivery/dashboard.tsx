import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../../components/Layout';
import { ApiResponse, Order } from '../../types';
import { api } from '../../utils/api';
import { socketManager } from '../../utils/socket';
import { getCurrentLocation } from '../../utils/helpers';

const DeliveryPartnerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [locationInterval, setLocationInterval] = useState<NodeJS.Timeout | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && user && user.role === 'delivery_partner') {
      fetchOrders();
      setupSocketListeners();
      getUserLocation();
    }

    return () => {
      if (locationInterval) {
        clearInterval(locationInterval);
      }
    };
  }, [mounted, user]);
  const fetchOrders = async () => {
    try {
      const response: ApiResponse<Order[]> = await api.get('/api/orders/my-orders');
      if (response.success && response.data) {
        setOrders(response.data);
        const activeOrder = response.data.find(order => 
          ['assigned', 'picked_up', 'in_transit'].includes(order.status)
        );
        setCurrentOrder(activeOrder || null);
      }
    } catch (err) {
      setError('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };
  const setupSocketListeners = () => {
    if (mounted && user && typeof window !== 'undefined') {
      socketManager.connect();
      socketManager.joinRoom({ userId: user._id, role: 'delivery_partner' });

      socketManager.on('order_assigned', (orderData) => {
        setOrders(prev => [...prev, orderData]);
        if (!currentOrder) {
          setCurrentOrder(orderData);
        }
      });
    }
  };

  const getUserLocation = () => {
    getCurrentLocation(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setCurrentLocation(location);
        setError('');
      },
      (error) => {
        setError('Failed to get current location. Please enable location access.');
      }
    );
  };

  const toggleOnlineStatus = async () => {
    try {
      const newStatus = !isOnline;
      const response: ApiResponse<any> = await api.put('/api/location/status', {
        isOnline: newStatus
      });

      if (response.success) {
        setIsOnline(newStatus);
        
        // Emit status change via socket
        socketManager.emit('delivery_partner_status', {
          userId: user?._id,
          isOnline: newStatus,
          vendorId: user?.vendorId
        });

        if (newStatus && currentLocation) {
          startLocationTracking();
        } else {
          stopLocationTracking();
        }
      }
    } catch (err) {
      setError('Failed to update status');
    }
  };

  const startLocationTracking = () => {
    if (locationInterval) {
      clearInterval(locationInterval);
    }

    const interval = setInterval(() => {
      getCurrentLocation(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setCurrentLocation(location);

          // Update location in database
          api.post('/api/location/update', {
            latitude: location.lat,
            longitude: location.lng,
            orderId: currentOrder?._id
          });

          // Emit real-time location update
          if (currentOrder) {
            socketManager.emit('location_update', {
              orderId: currentOrder._id,
              latitude: location.lat,
              longitude: location.lng,
              timestamp: new Date().toISOString()
            });
          }
        },
        (error) => {
          console.error('Location update failed:', error);
        }
      );
    }, 3000); // Update every 3 seconds

    setLocationInterval(interval);
  };

  const stopLocationTracking = () => {
    if (locationInterval) {
      clearInterval(locationInterval);
      setLocationInterval(null);
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
  const updateOrderStatus = async (orderId: string, status: 'pending' | 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled') => {
    try {
      const response: ApiResponse<Order> = await api.put(`/api/orders/${orderId}/status`, { status });
      
      if (response.success && response.data) {
        setOrders(orders.map(order => 
          order._id === orderId ? { ...order, status } : order
        ));
        
        if (currentOrder?._id === orderId) {
          setCurrentOrder({ ...currentOrder, status });
        }

        // Emit status update via socket
        socketManager.emit('order_status_update', {
          orderId,
          status,
          vendorId: currentOrder?.vendorId
        });
      }
    } catch (err) {
      setError('Failed to update order status');
    }
  };

  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case 'assigned': return 'picked_up';
      case 'picked_up': return 'in_transit';
      case 'in_transit': return 'delivered';
      default: return null;
    }
  };

  const getNextStatusLabel = (currentStatus: string) => {
    switch (currentStatus) {
      case 'assigned': return 'Mark as Picked Up';
      case 'picked_up': return 'Start Delivery';
      case 'in_transit': return 'Mark as Delivered';
      default: return null;
    }
  };
  if (!mounted) {
    return null; // Prevent SSR issues
  }

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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Delivery Partner Dashboard</h1>
          <p className="mt-2 text-gray-600">Manage your deliveries and track your location</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Status Toggle */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium text-gray-900">Status</h2>
              <p className="text-sm text-gray-600">
                Toggle your availability for new deliveries
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className={`text-sm font-medium ${isOnline ? 'text-green-600' : 'text-gray-600'}`}>
                {isOnline ? 'Online' : 'Offline'}
              </span>
              <button
                onClick={toggleOnlineStatus}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  isOnline ? 'bg-green-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    isOnline ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
          
          {currentLocation && (
            <div className="mt-4 text-sm text-gray-600">
              <p><strong>Current Location:</strong> {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}</p>
            </div>
          )}
        </div>

        {/* Current Order */}
        {currentOrder && (
          <div className="bg-white shadow rounded-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">Current Delivery</h2>
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(currentOrder.status)}`}>
                {currentOrder.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Order Details</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p><strong>Order ID:</strong> #{currentOrder._id.slice(-6)}</p>                  <p><strong>Customer:</strong> {currentOrder.customer?.name || currentOrder.customerName}</p>
                  <p><strong>Phone:</strong> {currentOrder.customer?.phone || currentOrder.customerPhone}</p>
                  <p><strong>Amount:</strong> ₹{currentOrder.amount || 0}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Addresses</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>
                    <strong>Pickup:</strong>
                    <p>{currentOrder.pickupAddress}</p>
                  </div>
                  <div>
                    <strong>Delivery:</strong>
                    <p>{currentOrder.deliveryAddress}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex space-x-4">
              {getNextStatus(currentOrder.status) && (
                <button
                  onClick={() => updateOrderStatus(currentOrder._id, getNextStatus(currentOrder.status)!)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  {getNextStatusLabel(currentOrder.status)}
                </button>
              )}
              
              {currentOrder.status !== 'delivered' && currentOrder.status !== 'cancelled' && (
                <button
                  onClick={() => updateOrderStatus(currentOrder._id, 'cancelled')}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                >
                  Cancel Order
                </button>
              )}
            </div>
          </div>
        )}

        {/* Orders History */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Order History</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {orders.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">
                No orders assigned yet
              </div>
            ) : (
              orders.map((order) => (
                <div key={order._id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-sm font-medium text-gray-900">
                          Order #{order._id.slice(-6)}
                        </h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                          {order.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <div className="mt-1 text-sm text-gray-600">
                        <p>{order.customer?.name || order.customerName} • ₹{order.amount || 0}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DeliveryPartnerDashboard;

// Force server-side rendering to prevent static generation issues
export async function getServerSideProps() {
  return {
    props: {}, // will be passed to the page component as props
  };
}
