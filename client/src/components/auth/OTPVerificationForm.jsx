import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { verifyPasswordResetOTP, clearError } from '../../store/forget-password';

const OTPVerificationForm = ({ emailOrPhone, onVerificationSuccess }) => {
  const [otp, setOtp] = useState('');
  
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector(state => state.forgotPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!otp.trim() || otp.length !== 6) {
      return;
    }

    try {
      const result = await dispatch(verifyPasswordResetOTP({ 
        emailOrPhone,
        otp: otp.trim()
      })).unwrap();
      
      if (result.success && result.resetToken) {
        onVerificationSuccess(result.resetToken);
      }
    } catch (error) {
      console.error('OTP verification failed:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
          Enter OTP
        </label>
        <input
          id="otp"
          type="text"
          placeholder="Enter 6-digit OTP"
          value={otp}
          onChange={(e) => {
            setOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
            // Clear error when user starts typing
            if (error) {
              dispatch(clearError());
            }
          }}
          disabled={isLoading}
          required
          maxLength={6}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-lg tracking-widest"
        />
        <p className="text-sm text-gray-600">
          Please enter the 6-digit OTP sent to your email.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      <button 
        type="submit" 
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={isLoading || otp.length !== 6}
      >
        {isLoading ? 'Verifying...' : 'Verify OTP'}
      </button>
    </form>
  );
};

export default OTPVerificationForm;
