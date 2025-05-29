import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    role: 'vendor',
    businessName: '',
    businessAddress: '',
    businessPhone: '',
    vehicleType: 'bike',
    licenseNumber: '',
    vendorId: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [vendors, setVendors] = useState<any[]>([]);

  const { register, user } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  React.useEffect(() => {
    // For demo purposes, we'll create some sample vendors
    setVendors([
      { _id: '507f1f77bcf86cd799439011', businessName: 'QuickEats Restaurant' },
      { _id: '507f1f77bcf86cd799439012', businessName: 'FastMart Grocery' },
      { _id: '507f1f77bcf86cd799439013', businessName: 'MediCare Pharmacy' },
    ]);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const userData: any = {
        email: formData.email,
        password: formData.password,
        name: formData.name,
        role: formData.role,
      };

      if (formData.role === 'vendor') {
        userData.businessName = formData.businessName;
        userData.businessAddress = formData.businessAddress;
        userData.businessPhone = formData.businessPhone;
      } else if (formData.role === 'delivery_partner') {
        userData.vehicleType = formData.vehicleType;
        userData.licenseNumber = formData.licenseNumber;
        userData.vendorId = formData.vendorId;
      }

      await register(userData);
    } catch (error: any) {
      setError(error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout requireAuth={false}>
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Create your account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-primary-600 hover:text-primary-500">
                Sign in
              </Link>
            </p>
          </div>
          
          <div className="card">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}
              
              <div>
                <label htmlFor="role" className="label">
                  Account Type
                </label>
                <select
                  id="role"
                  name="role"
                  required
                  className="input"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="vendor">Vendor/Restaurant</option>
                  <option value="delivery_partner">Delivery Partner</option>
                </select>
              </div>

              <div>
                <label htmlFor="name" className="label">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="input"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <label htmlFor="email" className="label">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="input"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="password" className="label">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="input"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="label">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="input"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>

              {/* Vendor specific fields */}
              {formData.role === 'vendor' && (
                <>
                  <div>
                    <label htmlFor="businessName" className="label">
                      Business Name
                    </label>
                    <input
                      id="businessName"
                      name="businessName"
                      type="text"
                      required
                      className="input"
                      placeholder="Enter your business name"
                      value={formData.businessName}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label htmlFor="businessAddress" className="label">
                      Business Address
                    </label>
                    <input
                      id="businessAddress"
                      name="businessAddress"
                      type="text"
                      required
                      className="input"
                      placeholder="Enter your business address"
                      value={formData.businessAddress}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label htmlFor="businessPhone" className="label">
                      Business Phone
                    </label>
                    <input
                      id="businessPhone"
                      name="businessPhone"
                      type="tel"
                      required
                      className="input"
                      placeholder="Enter your business phone"
                      value={formData.businessPhone}
                      onChange={handleChange}
                    />
                  </div>
                </>
              )}

              {/* Delivery partner specific fields */}
              {formData.role === 'delivery_partner' && (
                <>
                  <div>
                    <label htmlFor="vendorId" className="label">
                      Select Vendor
                    </label>
                    <select
                      id="vendorId"
                      name="vendorId"
                      required
                      className="input"
                      value={formData.vendorId}
                      onChange={handleChange}
                    >
                      <option value="">Select a vendor</option>
                      {vendors.map(vendor => (
                        <option key={vendor._id} value={vendor._id}>
                          {vendor.businessName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="vehicleType" className="label">
                      Vehicle Type
                    </label>
                    <select
                      id="vehicleType"
                      name="vehicleType"
                      required
                      className="input"
                      value={formData.vehicleType}
                      onChange={handleChange}
                    >
                      <option value="bike">Motorcycle</option>
                      <option value="bicycle">Bicycle</option>
                      <option value="car">Car</option>
                    </select>
                  </div>

                  {formData.vehicleType !== 'bicycle' && (
                    <div>
                      <label htmlFor="licenseNumber" className="label">
                        License Number
                      </label>
                      <input
                        id="licenseNumber"
                        name="licenseNumber"
                        type="text"
                        required
                        className="input"
                        placeholder="Enter your license number"
                        value={formData.licenseNumber}
                        onChange={handleChange}
                      />
                    </div>
                  )}
                </>
              )}

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn btn-primary"
                >
                  {loading ? 'Creating account...' : 'Create account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default RegisterPage;
