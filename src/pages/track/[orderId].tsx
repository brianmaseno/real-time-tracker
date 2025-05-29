import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import Layout from '../../components/Layout';
import { ApiResponse, Order } from '../../types';
import { api } from '../../utils/api';
import { socketManager } from '../../utils/socket';

// Dynamically import map component to avoid SSR issues
const MapComponent = dynamic(() => import('../../components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="h-96 bg-gray-200 rounded-lg flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  )
});

const TrackOrder: React.FC = () => {
  const router = useRouter();
  const { orderId } = router.query;
  const [order, setOrder] = useState<Order | null>(null);
  const [deliveryLocation, setDeliveryLocation] = useState<{lat: number, lng: number} | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (orderId && typeof orderId === 'string') {
      fetchOrder();
      setupSocketListeners();
    }
  }, [orderId]);
  const fetchOrder = async () => {
    try {
      const response: ApiResponse<Order> = await api.get(`/api/orders/${orderId}`);
      if (response.success && response.data) {
        setOrder(response.data);
        
        // Fetch latest location if order is in transit
        if (['picked_up', 'in_transit'].includes(response.data.status)) {
          fetchLatestLocation();
        }
      } else {
        setError('Order not found');
      }
    } catch (err) {
      setError('Failed to fetch order details');
    } finally {
      setLoading(false);
    }
  };

  const fetchLatestLocation = async () => {
    try {
      const response: ApiResponse<{latitude: number, longitude: number}> = await api.get(`/api/location/${orderId}`);
      if (response.success && response.data) {
        setDeliveryLocation({
          lat: response.data.latitude,
          lng: response.data.longitude
        });
      }
    } catch (err) {
      console.error('Failed to fetch location:', err);
    }
  };
  const setupSocketListeners = () => {
    if (orderId) {
      socketManager.connect();
      socketManager.joinRoom({ 
        userId: 'customer', 
        role: 'customer', 
        orderId: orderId as string 
      });

      socketManager.on('location_update', (data) => {
        if (data.orderId === orderId) {
          setDeliveryLocation({
            lat: data.latitude,
            lng: data.longitude
          });
        }
      });

      socketManager.on('order_status_updated', (data) => {
        if (data.orderId === orderId && order) {
          setOrder({ ...order, status: data.status });
        }
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'picked_up': return 'bg-purple-100 text-purple-800';
      case 'in_transit': return 'bg-orange-100 text-orange-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'pending': return 'Your order is being processed';
      case 'assigned': return 'A delivery partner has been assigned';
      case 'picked_up': return 'Your order has been picked up';
      case 'in_transit': return 'Your order is on the way';
      case 'delivered': return 'Your order has been delivered';
      case 'cancelled': return 'Your order has been cancelled';
      default: return 'Order status unknown';
    }
  };

  const getEstimatedTime = () => {
    if (!order) return null;
    
    const now = new Date();
    const orderTime = new Date(order.createdAt);
    const timePassed = Math.floor((now.getTime() - orderTime.getTime()) / (1000 * 60)); // minutes
    
    switch (order.status) {
      case 'pending':
      case 'assigned':
        return '15-30 minutes';
      case 'picked_up':
        return '10-20 minutes';
      case 'in_transit':
        return '5-15 minutes';
      default:
        return null;
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

  if (error || !order) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.5 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Order not found</h3>
            <p className="mt-1 text-sm text-gray-500">{error}</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Track Your Order</h1>
          <p className="mt-2 text-gray-600">Order #{order._id.slice(-6)}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Status */}
          <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900">Order Status</h2>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(order.status)}`}>
                  {order.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              
              <p className="text-gray-600 mb-4">{getStatusMessage(order.status)}</p>
              
              {getEstimatedTime() && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                  <p className="text-sm text-blue-800">
                    <strong>Estimated delivery time:</strong> {getEstimatedTime()}
                  </p>
                </div>
              )}
            </div>

            {/* Order Details */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Order Details</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-900">Customer</label>                  <p className="text-gray-600">{order.customer?.name || order.customerName}</p>
                  <p className="text-gray-600">{order.customer?.phone || order.customerPhone}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-900">Pickup Address</label>
                  <p className="text-gray-600">{order.pickupAddress}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-900">Delivery Address</label>
                  <p className="text-gray-600">{order.deliveryAddress}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-900">Amount</label>
                  <p className="text-gray-600">₹{order.amount || order.totalAmount || 0}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-900">Order Time</label>
                  <p className="text-gray-600">
                    {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Delivery Partner Info */}
            {order.assignedTo && (
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Delivery Partner</h2>
                <div className="space-y-2">
                  <p className="text-gray-600">
                    <strong>Name:</strong> {order.assignedTo.name || 'Loading...'}
                  </p>
                  <p className="text-gray-600">
                    <strong>Vehicle:</strong> {order.assignedTo.vehicleType || 'Loading...'}
                  </p>
                  <p className="text-gray-600">
                    <strong>Phone:</strong> {order.assignedTo.phone || 'Loading...'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Map */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Live Tracking</h2>
            
            {(['picked_up', 'in_transit'].includes(order.status) && deliveryLocation) ? (
              <MapComponent
                deliveryLocation={deliveryLocation}
                pickupAddress={order.pickupAddress}
                deliveryAddress={order.deliveryAddress}
                orderStatus={order.status}
              />
            ) : (
              <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p className="mt-2 text-sm text-gray-500">
                    {order.status === 'delivered' ? 'Order delivered!' : 
                     order.status === 'cancelled' ? 'Order cancelled' :
                     'Tracking will be available once pickup starts'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Progress Timeline */}
        <div className="mt-8 bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Order Progress</h2>
          
          <div className="relative">
            <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-gray-200"></div>
            
            <div className="space-y-6">
              {[
                { status: 'pending', label: 'Order Placed', desc: 'Your order has been received' },
                { status: 'assigned', label: 'Delivery Partner Assigned', desc: 'A delivery partner has been assigned' },
                { status: 'picked_up', label: 'Order Picked Up', desc: 'Your order has been picked up' },
                { status: 'in_transit', label: 'Out for Delivery', desc: 'Your order is on the way' },
                { status: 'delivered', label: 'Delivered', desc: 'Your order has been delivered' }
              ].map((step, index) => {
                const isCompleted = ['pending', 'assigned', 'picked_up', 'in_transit', 'delivered'].indexOf(order.status) >= index;
                const isCurrent = order.status === step.status;
                
                return (
                  <div key={step.status} className="relative flex items-start">
                    <div className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                      isCompleted ? 'bg-blue-600 border-blue-600' : 
                      isCurrent ? 'bg-white border-blue-600' : 'bg-white border-gray-300'
                    }`}>
                      {isCompleted ? (
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <div className={`w-2 h-2 rounded-full ${isCurrent ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                      )}
                    </div>
                    <div className="ml-4">
                      <h3 className={`text-sm font-medium ${isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-500'}`}>
                        {step.label}
                      </h3>
                      <p className={`text-sm ${isCompleted || isCurrent ? 'text-gray-600' : 'text-gray-400'}`}>
                        {step.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TrackOrder;
