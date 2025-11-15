'use client';
import { useState } from 'react';
import Link from 'next/link';
import AuthLayout from '@/components/Auth/AuthLayout';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

 
const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!validateForm()) return;

      setIsLoading(true);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        const data = await response.json();

        if (response.ok) {
          
          localStorage.setItem('token', data.token);
          
          
          if (data.data && data.data.user) {
            localStorage.setItem('user', JSON.stringify(data.data.user));
          } else {
            
            const basicUser = {
              userName: formData.email.split('@')[0], 
              email: formData.email
            };
            localStorage.setItem('user', JSON.stringify(basicUser));
          }
          
          
          window.location.href = '/dashboard';
        } else {
          setErrors({ submit: data.message || 'Invalid credentials' });
        }
      } catch (error) {
        setErrors({ submit: 'Network error. Please try again.' });
      } finally {
        setIsLoading(false);
      }
    };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Continue your learning adventure"
      error={errors.submit}
    >
      <form className="space-y-6" onSubmit={handleSubmit} noValidate>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-900">
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={formData.email}
            onChange={handleChange}
            className={`mt-1 block w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-funlearn6 focus:border-transparent transition-colors text-gray-900 placeholder-gray-500 ${
              errors.email ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter your email"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-medium text-gray-900">
              Password
            </label>
            <Link href="/forgot-password" className="text-sm text-funlearn6 hover:text-funlearn7">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              value={formData.password}
              onChange={handleChange}
              className={`mt-1 block w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-funlearn6 focus:border-transparent transition-colors text-gray-900 placeholder-gray-500 pr-10 ${
                errors.password ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute inset-y-0 right-0 pr-3 flex items-center mt-1"
            >
              {showPassword ? (
                <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-funlearn6 text-white py-3 px-4 rounded-lg font-semibold hover:bg-funlearn7 focus:ring-2 focus:ring-funlearn6 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Signing In...' : 'Sign In'}
        </button>

        <div className="text-center">
          <p className="text-gray-600 text-sm">
            Don't have an account?{' '}
            <Link href="/signup" className="text-funlearn6 font-semibold hover:text-funlearn7">
              Sign up
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}