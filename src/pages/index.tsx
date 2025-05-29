import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import Link from 'next/link';

const Home: React.FC = () => {
  const { user } = useAuth();

  const getRoleDashboard = () => {
    switch (user?.role) {
      case 'vendor':
        return '/vendor/dashboard';
      case 'delivery_partner':
        return '/delivery/dashboard';
      case 'customer':
        return '/place-order';
      default:
        return '/login';
    }
  };

  const features = [
    {
      icon: (
        <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      title: 'Real-time Tracking',
      description: 'Track your deliveries in real-time with live location updates every 3 seconds.'
    },
    {
      icon: (
        <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
      title: 'Multi-tenant Platform',
      description: 'Support for multiple vendors with their own delivery partner networks.'
    },
    {
      icon: (
        <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: 'Instant Updates',
      description: 'Get instant notifications about order status changes and delivery updates.'
    },
    {
      icon: (
        <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      title: 'Analytics Dashboard',
      description: 'Comprehensive analytics and reporting for vendors and delivery partners.'
    }
  ];

  const roleCards = [
    {
      role: 'vendor',
      title: 'Vendor Dashboard',
      description: 'Manage orders, assign delivery partners, and track business performance.',
      color: 'bg-blue-600',
      link: '/vendor/dashboard'
    },
    {
      role: 'delivery_partner',
      title: 'Delivery Partner',
      description: 'Accept orders, update delivery status, and track your earnings.',
      color: 'bg-green-600',
      link: '/delivery/dashboard'
    },
    {
      role: 'customer',
      title: 'Place Order',
      description: 'Place delivery orders and track them in real-time.',
      color: 'bg-purple-600',
      link: '/place-order'
    }
  ];

  return (
    <Layout>
      <div className="bg-white">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
              <svg
                className="hidden lg:block absolute right-0 inset-y-0 h-full w-48 text-white transform translate-x-1/2"
                fill="currentColor"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <polygon points="50,0 100,0 50,100 0,100" />
              </svg>

              <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
                <div className="sm:text-center lg:text-left">
                  <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                    <span className="block xl:inline">Real-time</span>{' '}
                    <span className="block text-blue-600 xl:inline">Delivery Tracking</span>
                  </h1>
                  <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                    A comprehensive multivendor delivery platform with real-time location tracking, 
                    instant updates, and seamless order management for vendors, delivery partners, and customers.
                  </p>
                  <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                    {user ? (
                      <div className="rounded-md shadow">
                        <Link
                          href={getRoleDashboard()}
                          className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
                        >
                          Go to Dashboard
                        </Link>
                      </div>
                    ) : (
                      <>
                        <div className="rounded-md shadow">
                          <Link
                            href="/register"
                            className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
                          >
                            Get Started
                          </Link>
                        </div>
                        <div className="mt-3 sm:mt-0 sm:ml-3">
                          <Link
                            href="/login"
                            className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 md:py-4 md:text-lg md:px-10"
                          >
                            Sign In
                          </Link>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </main>
            </div>
          </div>
          <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
            <div className="h-56 w-full bg-gradient-to-br from-blue-50 to-blue-100 sm:h-72 md:h-96 lg:w-full lg:h-full flex items-center justify-center">
              <div className="text-center">
                <svg className="mx-auto h-24 w-24 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p className="mt-4 text-lg text-blue-700 font-medium">Live Tracking</p>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:text-center">
              <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Features</h2>
              <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                Everything you need for delivery management
              </p>
            </div>

            <div className="mt-10">
              <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
                {features.map((feature, index) => (
                  <div key={index} className="relative">
                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-100">
                      {feature.icon}
                    </div>
                    <p className="ml-16 text-lg leading-6 font-medium text-gray-900">{feature.title}</p>
                    <p className="mt-2 ml-16 text-base text-gray-500">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Role-based Access Section */}
        <div className="bg-gray-50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:text-center">
              <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Access Portals</h2>
              <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                Choose your role
              </p>
              <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
                Different dashboards for different user types, each optimized for specific needs.
              </p>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {roleCards.map((card, index) => (
                <div key={index} className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-6">
                    <div className={`inline-flex items-center justify-center h-12 w-12 rounded-md ${card.color} mb-4`}>
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">{card.title}</h3>
                    <p className="mt-2 text-base text-gray-500">{card.description}</p>
                    <div className="mt-4">
                      <Link
                        href={card.link}
                        className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${card.color} hover:opacity-90`}
                      >
                        Access Portal
                        <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Demo Accounts Section */}
        <div className="bg-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-blue-50 rounded-lg p-8">
              <div className="lg:text-center">
                <h2 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">
                  Try with Demo Accounts
                </h2>
                <p className="mt-4 text-lg text-gray-600">
                  Test the platform with pre-configured demo accounts for each role
                </p>
              </div>

              <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="bg-white rounded-lg p-6 shadow">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Vendor Demo</h3>
                  <p className="text-sm text-gray-600 mb-4">Email: vendor@demo.com</p>
                  <p className="text-sm text-gray-600 mb-4">Password: vendor123</p>
                  <Link
                    href="/login"
                    className="inline-flex items-center px-3 py-2 border border-blue-300 shadow-sm text-sm leading-4 font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50"
                  >
                    Try Vendor Portal
                  </Link>
                </div>

                <div className="bg-white rounded-lg p-6 shadow">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Delivery Partner Demo</h3>
                  <p className="text-sm text-gray-600 mb-4">Email: delivery@demo.com</p>
                  <p className="text-sm text-gray-600 mb-4">Password: delivery123</p>
                  <Link
                    href="/login"
                    className="inline-flex items-center px-3 py-2 border border-green-300 shadow-sm text-sm leading-4 font-medium rounded-md text-green-700 bg-white hover:bg-green-50"
                  >
                    Try Delivery Portal
                  </Link>
                </div>

                <div className="bg-white rounded-lg p-6 shadow">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Customer Demo</h3>
                  <p className="text-sm text-gray-600 mb-4">Email: customer@demo.com</p>
                  <p className="text-sm text-gray-600 mb-4">Password: customer123</p>
                  <Link
                    href="/login"
                    className="inline-flex items-center px-3 py-2 border border-purple-300 shadow-sm text-sm leading-4 font-medium rounded-md text-purple-700 bg-white hover:bg-purple-50"
                  >
                    Try Customer Portal
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home;
