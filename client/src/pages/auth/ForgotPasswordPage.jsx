import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import ForgotPasswordForm from '../../components/auth/ForgotPasswordForm';
import OTPVerificationForm from '../../components/auth/OTPVerificationForm';
import PasswordResetForm from '../../components/auth/PasswordResetForm';
import { resetForgotPasswordState } from '../../store/forget-password';

const ForgotPasswordPage = () => {
  const [currentStep, setCurrentStep] = useState(1); // 1: Email, 2: OTP, 3: Password Reset, 4: Success
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [resetToken, setResetToken] = useState('');
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleEmailSubmitSuccess = (submittedEmailOrPhone) => {
    setEmailOrPhone(submittedEmailOrPhone);
    setCurrentStep(2);
  };

  const handleOTPVerificationSuccess = (token) => {
    setResetToken(token);
    setCurrentStep(3);
  };

  const handlePasswordResetSuccess = () => {
    setCurrentStep(4);
    // Reset the forgot password state
    dispatch(resetForgotPasswordState());
  };

  const handleStartOver = () => {
    setCurrentStep(1);
    setEmailOrPhone('');
    setResetToken('');
    dispatch(resetForgotPasswordState());
  };

  const renderStepIndicator = () => {
    const steps = [
      { number: 1, title: 'Email/Phone', active: currentStep >= 1, completed: currentStep > 1 },
      { number: 2, title: 'Verify OTP', active: currentStep >= 2, completed: currentStep > 2 },
      { number: 3, title: 'New Password', active: currentStep >= 3, completed: currentStep > 3 },
      { number: 4, title: 'Complete', active: currentStep >= 4, completed: currentStep > 4 }
    ];

    return (
      <div className="flex items-center justify-center mb-8">
        {steps.map((step, index) => (
          <React.Fragment key={step.number}>
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step.completed 
                  ? 'bg-green-500 text-white' 
                  : step.active 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-300 text-gray-600'
              }`}>
                {step.completed ? '✓' : step.number}
              </div>
              <span className="text-xs mt-1 text-gray-600">{step.title}</span>
            </div>
            {index < steps.length - 1 && (
              <div className={`w-12 h-0.5 mx-2 ${
                step.completed ? 'bg-green-500' : 'bg-gray-300'
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div>
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
              Forgot Password
            </h2>
            <p className="text-center text-gray-600 mb-6">
              Enter your email or phone number to receive an OTP
            </p>
            <ForgotPasswordForm onSuccess={handleEmailSubmitSuccess} />
          </div>
        );
      
      case 2:
        return (
          <div>
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
              Verify OTP
            </h2>
            <p className="text-center text-gray-600 mb-6">
              Enter the OTP sent to your email address
            </p>
            <OTPVerificationForm 
              emailOrPhone={emailOrPhone}
              onVerificationSuccess={handleOTPVerificationSuccess}
            />
            <div className="mt-4 text-center">
              <button
                type="button"
                className="text-sm text-blue-600 hover:text-blue-800"
                onClick={() => setCurrentStep(1)}
              >
                ← Back to Email/Phone
              </button>
            </div>
          </div>
        );
      
      case 3:
        return (
          <div>
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
              Reset Password
            </h2>
            <p className="text-center text-gray-600 mb-6">
              Enter your new password
            </p>
            <PasswordResetForm 
              resetToken={resetToken}
              onResetSuccess={handlePasswordResetSuccess}
            />
            <div className="mt-4 text-center">
              <button
                type="button"
                className="text-sm text-blue-600 hover:text-blue-800"
                onClick={() => setCurrentStep(2)}
              >
                ← Back to OTP Verification
              </button>
            </div>
          </div>
        );
      
      case 4:
        return (
          <div className="text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Password Reset Successful!
              </h2>
              <p className="text-gray-600 mb-6">
                Your password has been successfully reset. You can now login with your new password.
              </p>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={() => navigate('/auth/login')}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Go to Login
              </button>
              
              <button
                onClick={handleStartOver}
                className="w-full px-4 py-2 text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Reset Another Password
              </button>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white p-8 rounded-lg shadow-md">
          {renderStepIndicator()}
          {renderCurrentStep()}
          
          {currentStep < 4 && (
            <div className="mt-6 text-center">
              <Link
                to="/auth/login"
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Remember your password? Sign in
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
