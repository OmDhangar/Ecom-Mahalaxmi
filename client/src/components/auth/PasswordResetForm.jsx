import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { resetUserPassword, clearError } from '../../store/forget-password';

const PasswordResetForm = ({ resetToken, onResetSuccess }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector(state => state.forgotPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newPassword || !confirmPassword) {
      return;
    }

    if (newPassword !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    if (newPassword.length < 6) {
      alert('Password must be at least 6 characters long!');
      return;
    }

    try {
      const result = await dispatch(resetUserPassword({ 
        resetToken,
        newPassword
      })).unwrap();
      
      if (result.success) {
        onResetSuccess();
      }
    } catch (error) {
      console.error('Password reset failed:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
          New Password
        </label>
        <div className="relative">
          <input
            id="newPassword"
            type={showPassword ? "text" : "password"}
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              // Clear error when user starts typing
              if (error) {
                dispatch(clearError());
              }
            }}
            disabled={isLoading}
            required
            minLength={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
              </svg>
            ) : (
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
          Confirm New Password
        </label>
        <input
          id="confirmPassword"
          type={showPassword ? "text" : "password"}
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={isLoading}
          required
          minLength={6}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="text-sm text-gray-600">
        <p>Password requirements:</p>
        <ul className="list-disc list-inside mt-1 space-y-1">
          <li>At least 6 characters long</li>
          <li>Must match confirmation password</li>
        </ul>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      <button 
        type="submit" 
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={isLoading || !newPassword || !confirmPassword || newPassword !== confirmPassword}
      >
        {isLoading ? 'Resetting...' : 'Reset Password'}
      </button>
    </form>
  );
};

export default PasswordResetForm;
