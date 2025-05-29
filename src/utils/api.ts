import { ApiResponse } from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
    
    // Get token from localStorage if available
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('auth_token', token);
      } else {
        localStorage.removeItem('auth_token');
      }
    }
  }
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  // Generic HTTP methods
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'GET',
    });
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData: any) {
    return this.request<{ token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getCurrentUser() {
    return this.request<any>('/auth/me');
  }

  async updateProfile(userData: any) {
    return this.request<any>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async getDeliveryPartners() {
    return this.request<any[]>('/auth/delivery-partners');
  }

  // Order endpoints
  async createOrder(orderData: any) {
    return this.request<any>('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async getOrders(params?: { status?: string; page?: number; limit?: number }) {
    const queryString = params ? new URLSearchParams(params as any).toString() : '';
    return this.request<{ orders: any[]; pagination: any }>(`/orders${queryString ? `?${queryString}` : ''}`);
  }

  async getOrder(orderId: string) {
    return this.request<any>(`/orders/${orderId}`);
  }

  async assignDeliveryPartner(orderId: string, deliveryPartnerId: string) {
    return this.request<any>(`/orders/${orderId}/assign`, {
      method: 'PUT',
      body: JSON.stringify({ deliveryPartnerId }),
    });
  }

  async updateOrderStatus(orderId: string, status: string) {
    return this.request<any>(`/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async trackOrder(trackingId: string) {
    return this.request<any>(`/orders/track/${trackingId}`);
  }

  // Location endpoints
  async updateLocation(locationData: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    heading?: number;
    speed?: number;
    orderId?: string;
  }) {
    return this.request<any>('/location/update', {
      method: 'POST',
      body: JSON.stringify(locationData),
    });
  }

  async getCurrentLocation(deliveryPartnerId: string) {
    return this.request<any>(`/location/current/${deliveryPartnerId}`);
  }

  async getLocationHistory(orderId: string) {
    return this.request<any[]>(`/location/history/${orderId}`);
  }

  async trackLocationByTrackingId(trackingId: string) {
    return this.request<any>(`/location/track/${trackingId}`);
  }

  async toggleOnlineStatus() {
    return this.request<{ isOnline: boolean }>('/location/toggle-online', {
      method: 'PUT',
    });
  }

  // Health check
  async healthCheck() {
    return this.request<any>('/health');
  }
}

export const api = new ApiClient();
export default api;
