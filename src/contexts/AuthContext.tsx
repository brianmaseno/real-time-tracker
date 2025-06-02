import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, LoginResponse } from '@/types';
import { api } from '@/utils/api';
import { socketManager } from '@/utils/socket';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Set mounted state
  useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize auth state
  useEffect(() => {
    if (!mounted) return;
    
    const initAuth = async () => {
      try {
        const storedToken = localStorage.getItem('auth_token');
        if (storedToken) {
          api.setToken(storedToken);          const response = await api.get('/api/auth/me');
          if (response.success) {
            setUser(response.data as User);
            setToken(storedToken);
            
            // Join socket room only on client side
            if (typeof window !== 'undefined') {
              socketManager.joinRoom({
                userId: (response.data as User)._id,
                role: (response.data as User).role,
              });
            }
          } else {
            // Invalid token
            localStorage.removeItem('auth_token');
            api.setToken(null);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        localStorage.removeItem('auth_token');
        api.setToken(null);
      } finally {
        setLoading(false);
      }
    };    initAuth();
  }, [mounted]);const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/api/auth/login', { email, password });
      if (response.success && response.data) {
        const { token: authToken, user: userData } = response.data as LoginResponse;
          setUser(userData);
        setToken(authToken);
        api.setToken(authToken);
        localStorage.setItem('auth_token', authToken);
          // Join socket room only on client side
        if (typeof window !== 'undefined') {
          socketManager.joinRoom({
            userId: userData._id,
            role: userData.role,
          });
        }
      } else {
        throw new Error((response as any).message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };
  const register = async (userData: any) => {
    try {
      const response = await api.post('/api/auth/register', userData);
      if (response.success && response.data) {
        const { token: authToken, user: newUser } = response.data as LoginResponse;
          setUser(newUser);
        setToken(authToken);
        api.setToken(authToken);
        localStorage.setItem('auth_token', authToken);
          // Join socket room only on client side
        if (typeof window !== 'undefined') {
          socketManager.joinRoom({
            userId: newUser._id,
            role: newUser.role,
          });
        }
      } else {
        throw new Error((response as any).message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };  const logout = () => {
    setUser(null);
    setToken(null);
    api.setToken(null);
    localStorage.removeItem('auth_token');
    
    // Disconnect socket
    socketManager.disconnect();
    
    // Redirect to login page
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  };
  const updateUser = async (userData: Partial<User>) => {
    try {
      const response = await api.put('/api/auth/profile', userData);
      if (response.success) {
        setUser(response.data as User);
      } else {
        throw new Error((response as any).message || 'Profile update failed');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
