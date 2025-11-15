'use client';
import { useState } from 'react';
import Link from 'next/link';
import AuthLayout from '@/components/Auth/AuthLayout';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'email' | 'reset' | 'success'>('email');
  const [resetData, setResetData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateEmail = () => {
    if (!email) {
      setErrors({ email: 'Email is required' });
      return false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrors({ email: 'Please enter a valid email address' });
      return false;
    }
    return true;
  };

  const validateResetForm = () => {
    const newErrors: Record<string, string> = {};

    if (!resetData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (resetData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters long';
    } else if (!/(?=.*[A-Z])/.test(resetData.newPassword)) {
      newErrors.newPassword = 'Password must include at least one uppercase letter';
    } else if (!/(?=.*\d)/.test(resetData.newPassword)) {
      newErrors.newPassword = 'Password must include at least one number';
    } else if (!/(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])/.test(resetData.newPassword)) {
      newErrors.newPassword = 'Password must include at least one symbol';
    }

    if (!resetData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (resetData.newPassword !== resetData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail()) return;

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setStep('reset');
        setErrors({});
      } else {
        setErrors({ submit: data.message || 'Failed to send reset code' });
      }
    } catch (error) {
      setErrors({ submit: 'Network error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/users/resend-reset-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setErrors({ submit: 'New code sent to your email' });
      } else {
        setErrors({ submit: 'Failed to resend code. Try again.' });
      }
    } catch (error) {
      setErrors({ submit: 'Network error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateResetForm()) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          newPassword: resetData.newPassword,
          confirmPassword: resetData.confirmPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStep('success');
      } else {
        setErrors({ submit: data.message || 'Password reset failed' });
      }
    } catch (error) {
      setErrors({ submit: 'Network error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleNewPasswordVisibility = () => {
    setShowNewPassword(!showNewPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  if (step === 'success') {
    return (
      <AuthLayout
        title="Password Reset Successfully"
        subtitle="Your password has been updated successfully"
      >
        <div className="text-center space-y-6">
          <div className="w-16 h-16 bg-funlearn2 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-funlearn8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-gray-600">
            You can now sign in with your new password.
          </p>
          <Link
            href="/login"
            className="block w-full bg-funlearn6 text-white py-3 px-4 rounded-lg font-semibold hover:bg-funlearn7 focus:ring-2 focus:ring-funlearn6 focus:ring-offset-2 transition-colors"
          >
            Back to Sign In
          </Link>
        </div>
      </AuthLayout>
    );
  }

  if (step === 'reset') {
    return (
      <AuthLayout
        title="Reset Your Password"
        subtitle="Enter your new password below"
        error={errors.submit}
      >
        <form className="space-y-6" onSubmit={handleResetPassword} noValidate>
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-900">
              New Password
            </label>
            <div className="relative">
              <input
                id="newPassword"
                name="newPassword"
                type={showNewPassword ? "text" : "password"}
                required
                value={resetData.newPassword}
                onChange={(e) => setResetData({ ...resetData, newPassword: e.target.value })}
                className={`mt-1 block w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-funlearn6 focus:border-transparent transition-colors text-gray-900 placeholder-gray-500 pr-10 ${
                  errors.newPassword ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter new password"
              />
              <button
                type="button"
                onClick={toggleNewPasswordVisibility}
                className="absolute inset-y-0 right-0 pr-3 flex items-center mt-1"
              >
                {showNewPassword ? (
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
            {errors.newPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-900">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                required
                value={resetData.confirmPassword}
                onChange={(e) => setResetData({ ...resetData, confirmPassword: e.target.value })}
                className={`mt-1 block w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-funlearn6 focus:border-transparent transition-colors text-gray-900 placeholder-gray-500 pr-10 ${
                  errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Confirm new password"
              />
              <button
                type="button"
                onClick={toggleConfirmPasswordVisibility}
                className="absolute inset-y-0 right-0 pr-3 flex items-center mt-1"
              >
                {showConfirmPassword ? (
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
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-funlearn6 text-white py-3 px-4 rounded-lg font-semibold hover:bg-funlearn7 focus:ring-2 focus:ring-funlearn6 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Resetting Password...' : 'Reset Password'}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={handleResendCode}
              disabled={isLoading}
              className="text-sm text-funlearn6 hover:text-funlearn7 disabled:opacity-50"
            >
              Resend reset code
            </button>
          </div>
        </form>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Reset Your Password"
      subtitle="Enter your email to receive a reset code"
      error={errors.submit}
    >
      <form className="space-y-6" onSubmit={handleSendCode} noValidate>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-900">
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors({});
            }}
            className={`mt-1 block w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-funlearn6 focus:border-transparent transition-colors text-gray-900 placeholder-gray-500 ${
              errors.email ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter your email"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-funlearn6 text-white py-3 px-4 rounded-lg font-semibold hover:bg-funlearn7 focus:ring-2 focus:ring-funlearn6 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Sending Code...' : 'Send Reset Code'}
        </button>

        <div className="text-center">
          <Link href="/login" className="text-sm text-funlearn6 hover:text-funlearn7">
            Back to Sign In
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}