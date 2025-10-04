import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { sendPasswordResetOTP, clearError } from '../../store/forget-password';

const ForgotPasswordForm = ({ onSuccess }) => {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector(state => state.forgotPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!emailOrPhone.trim()) {
      return;
    }

    try {
      const result = await dispatch(sendPasswordResetOTP({ 
        emailOrPhone: emailOrPhone.trim() 
      })).unwrap();
      
      if (result.success) {
        onSuccess && onSuccess(emailOrPhone.trim());
      }
    } catch (error) {
      console.error('Password reset request failed:', error);
      // Error will be handled by Redux state and displayed in UI
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="emailOrPhone" className="block text-sm font-medium text-gray-700">
          Email or Phone Number
        </label>
        <input
          id="emailOrPhone"
          type="text"
          placeholder="Enter your email or phone number"
          value={emailOrPhone}
          onChange={(e) => {
            setEmailOrPhone(e.target.value);
            // Clear error when user starts typing
            if (error) {
              dispatch(clearError());
            }
          }}
          disabled={isLoading}
          required
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            error ? 'border-red-300 bg-red-50' : 'border-gray-300'
          }`}
        />
        <p className="text-sm text-gray-600">
          We'll send an OTP to your registered email address.
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
        disabled={isLoading || !emailOrPhone.trim()}
      >
        {isLoading ? 'Sending...' : 'Send Reset Code'}
      </button>
    </form>
  );
};

export default ForgotPasswordForm;
