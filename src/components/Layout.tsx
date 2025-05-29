import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';

interface LayoutProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  allowedRoles?: string[];
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  requireAuth = true, 
  allowedRoles = [] 
}) => {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && requireAuth) {
      if (!user) {
        router.push('/login');
        return;
      }
      
      if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        router.push('/unauthorized');
        return;
      }
    }
  }, [user, loading, requireAuth, allowedRoles, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (requireAuth && !user) {
    return null; // Will redirect to login
  }

  if (requireAuth && allowedRoles.length > 0 && !allowedRoles.includes(user!.role)) {
    return null; // Will redirect to unauthorized
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {user && (
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <h1 className="text-xl font-bold text-gray-900">
                    Real-Time Tracker
                  </h1>
                </div>
                <div className="ml-6">
                  <span className="text-sm text-gray-500 capitalize">
                    {user.role.replace('_', ' ')} Dashboard
                  </span>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">
                  Welcome, {user.name}
                </span>
                
                {user.role === 'delivery_partner' && (
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${user.isOnline ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                    <span className="text-xs text-gray-500">
                      {user.isOnline ? 'Online' : 'Offline'}
                    </span>
                  </div>
                )}
                
                <button
                  onClick={logout}
                  className="btn btn-secondary text-sm px-3 py-1"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </nav>
      )}
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;
