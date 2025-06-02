import { io, Socket } from 'socket.io-client';
import { LocationUpdate, OrderStatusUpdate } from '../types';

class SocketManager {
  private socket: Socket | null = null;
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;

  constructor() {
    // Don't auto-connect during SSR or build time
    if (typeof window !== 'undefined') {
      // Only connect on client side
    }
  }

  connect() {
    // Prevent connection during server-side rendering or build time
    if (typeof window === 'undefined') {
      console.log('Socket connection skipped during SSR/build');
      return;
    }

    if (this.socket?.connected) {
      return;
    }

    const serverUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5001';
    
    try {
      this.socket = io(serverUrl, {
        transports: ['websocket', 'polling'],
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 1000,
        timeout: 10000,
      });

      this.setupEventListeners();
    } catch (error) {
      console.error('Failed to initialize socket connection:', error);
    }
  }
  private setupEventListeners() {
    if (!this.socket || typeof window === 'undefined') return;

    this.socket.on('connect', () => {
      console.log('Connected to server');
      this.isConnected = true;
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected from server:', reason);
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
      }
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('Reconnected after', attemptNumber, 'attempts');
      this.isConnected = true;
      this.reconnectAttempts = 0;
    });
  }
  joinRoom(data: { userId: string; role: string; orderId?: string }) {
    if (typeof window === 'undefined') return;
    if (this.socket?.connected) {
      this.socket.emit('join_room', data);
    }
  }

  leaveRoom(roomId: string) {
    if (typeof window === 'undefined') return;
    if (this.socket?.connected) {
      this.socket.emit('leave_room', roomId);
    }
  }

  // Location updates
  emitLocationUpdate(data: LocationUpdate) {
    if (typeof window === 'undefined') return;
    if (this.socket?.connected) {
      this.socket.emit('location_update', data);
    }
  }

  onLocationUpdate(callback: (data: LocationUpdate) => void) {
    if (typeof window === 'undefined') return;
    if (this.socket) {
      this.socket.on('location_update', callback);
    }
  }
  offLocationUpdate(callback?: (data: LocationUpdate) => void) {
    if (typeof window === 'undefined') return;
    if (this.socket) {
      this.socket.off('location_update', callback);
    }
  }

  // Order status updates
  emitOrderStatusUpdate(data: OrderStatusUpdate & { vendorId?: string }) {
    if (typeof window === 'undefined') return;
    if (this.socket?.connected) {
      this.socket.emit('order_status_update', data);
    }
  }

  onOrderStatusUpdate(callback: (data: OrderStatusUpdate) => void) {
    if (typeof window === 'undefined') return;
    if (this.socket) {
      this.socket.on('order_status_updated', callback);
    }
  }

  offOrderStatusUpdate(callback?: (data: OrderStatusUpdate) => void) {
    if (typeof window === 'undefined') return;
    if (this.socket) {
      this.socket.off('order_status_updated', callback);
    }
  }

  // Order assignment
  onOrderAssigned(callback: (data: { order: any; message: string }) => void) {
    if (typeof window === 'undefined') return;
    if (this.socket) {
      this.socket.on('order_assigned', callback);
    }
  }

  offOrderAssigned(callback?: (data: { order: any; message: string }) => void) {
    if (typeof window === 'undefined') return;
    if (this.socket) {
      this.socket.off('order_assigned', callback);
    }
  }

  // Delivery partner status
  emitDeliveryPartnerStatus(data: { userId: string; isOnline: boolean; vendorId?: string }) {
    if (typeof window === 'undefined') return;
    if (this.socket?.connected) {
      this.socket.emit('delivery_partner_status', data);
    }
  }

  onDeliveryPartnerStatusUpdate(callback: (data: { deliveryPartnerId: string; isOnline: boolean }) => void) {
    if (typeof window === 'undefined') return;
    if (this.socket) {
      this.socket.on('delivery_partner_status_update', callback);
    }
  }
  offDeliveryPartnerStatusUpdate(callback?: (data: { deliveryPartnerId: string; isOnline: boolean }) => void) {
    if (typeof window === 'undefined') return;
    if (this.socket) {
      this.socket.off('delivery_partner_status_update', callback);
    }
  }

  // Generic event listeners
  on(event: string, callback: (...args: any[]) => void) {
    if (typeof window === 'undefined') return;
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event: string, callback?: (...args: any[]) => void) {
    if (typeof window === 'undefined') return;
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  emit(event: string, data?: any) {
    if (typeof window === 'undefined') return;
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    }
  }

  disconnect() {
    if (typeof window === 'undefined') return;
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  getConnectionStatus() {
    return this.isConnected;
  }

  getSocket() {
    return this.socket;
  }
}

// Export singleton instance
export const socketManager = new SocketManager();
export default socketManager;
