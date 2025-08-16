import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { useToast } from "@/components/ui/use-toast";
import CommonForm from "@/components/common/form";
import {
  sendPasswordResetOTP,
  verifyPasswordResetOTP,
  resetUserPassword,
  resetForgotPasswordState,
} from "@/store/forget-password/index";

// Form controls for different steps
const emailFormControls = [
  {
    name: "emailOrPhone",
    label: "Email or Phone Number",
    placeholder: "Enter your email or phone number",
    componentType: "input",
    type: "text",
  },
];

const otpFormControls = [
  {
    name: "otp",
    label: "Enter OTP",
    placeholder: "Enter 6-digit OTP",
    componentType: "input",
    type: "text",
    maxLength: 6,
  },
];

const passwordFormControls = [
  {
    name: "newPassword",
    label: "New Password",
    placeholder: "Enter new password",
    componentType: "input",
    type: "password",
  },
  {
    name: "confirmPassword",
    label: "Confirm New Password",
    placeholder: "Confirm your new password",
    componentType: "input",
    type: "password",
  },
];

function ForgotPassword() {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [emailFormData, setEmailFormData] = useState({ emailOrPhone: "" });
  const [otpFormData, setOtpFormData] = useState({ otp: "" });
  const [passwordFormData, setPasswordFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [countdown, setCountdown] = useState(0);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { isLoading, otpSent, otpVerified, resetToken, userEmail } = useSelector(
    (state) => state.forgotPassword
  );

  // Countdown timer for resend OTP
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // Reset state when component unmounts
  useEffect(() => {
    return () => {
      dispatch(resetForgotPasswordState());
    };
  }, [dispatch]);

  // Handle sending OTP
  const handleSendOTP = (event) => {
    event.preventDefault();
    
    if (!emailFormData.emailOrPhone.trim()) {
      toast({
        title: "Please enter your email or phone number",
        variant: "destructive",
      });
      return;
    }

    dispatch(sendPasswordResetOTP(emailFormData)).then((data) => {
      if (data?.payload?.success) {
        toast({
          title: data.payload.message,
        });
        setStep(2);
        setCountdown(60); // 60 seconds countdown for resend
      } else {
        toast({
          title: data?.payload?.message || "Failed to send OTP",
          variant: "destructive",
        });
      }
    });
  };

  // Handle OTP verification
  const handleVerifyOTP = (event) => {
    event.preventDefault();
    
    if (!otpFormData.otp.trim() || otpFormData.otp.length !== 6) {
      toast({
        title: "Please enter a valid 6-digit OTP",
        variant: "destructive",
      });
      return;
    }

    const verificationData = {
      emailOrPhone: emailFormData.emailOrPhone,
      otp: otpFormData.otp,
    };

    dispatch(verifyPasswordResetOTP(verificationData)).then((data) => {
      if (data?.payload?.success) {
        toast({
          title: data.payload.message,
        });
        setStep(3);
      } else {
        toast({
          title: data?.payload?.message || "Invalid OTP",
          variant: "destructive",
        });
      }
    });
  };

  // Handle password reset
  const handleResetPassword = (event) => {
    event.preventDefault();
    
    if (!passwordFormData.newPassword || !passwordFormData.confirmPassword) {
      toast({
        title: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
      toast({
        title: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (passwordFormData.newPassword.length < 6) {
      toast({
        title: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    const resetData = {
      resetToken,
      newPassword: passwordFormData.newPassword,
    };

    dispatch(resetUserPassword(resetData)).then((data) => {
      if (data?.payload?.success) {
        toast({
          title: data.payload.message,
        });
        dispatch(resetForgotPasswordState());
        navigate("/auth/login");
      } else {
        toast({
          title: data?.payload?.message || "Failed to reset password",
          variant: "destructive",
        });
      }
    });
  };

  // Handle resend OTP
  const handleResendOTP = () => {
    if (countdown > 0) return;
    
    dispatch(sendPasswordResetOTP(emailFormData)).then((data) => {
      if (data?.payload?.success) {
        toast({
          title: "OTP sent successfully",
        });
        setCountdown(60);
        setOtpFormData({ otp: "" }); // Clear previous OTP
      } else {
        toast({
          title: data?.payload?.message || "Failed to resend OTP",
          variant: "destructive",
        });
      }
    });
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-foreground">Forgot Password?</h2>
              <p className="text-sm text-muted-foreground mt-2">
                Enter your email or phone number and we'll send you an OTP to reset your password
              </p>
            </div>
            <CommonForm
              formControls={emailFormControls}
              buttonText={isLoading ? "Sending..." : "Send OTP"}
              formData={emailFormData}
              setFormData={setEmailFormData}
              onSubmit={handleSendOTP}
              disabled={isLoading}
            />
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-foreground">Verify OTP</h2>
              <p className="text-sm text-muted-foreground mt-2">
                We've sent a 6-digit OTP to {userEmail}
              </p>
            </div>
            <CommonForm
              formControls={otpFormControls}
              buttonText={isLoading ? "Verifying..." : "Verify OTP"}
              formData={otpFormData}
              setFormData={setOtpFormData}
              onSubmit={handleVerifyOTP}
              disabled={isLoading}
            />
            <div className="text-center mt-4">
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={countdown > 0 || isLoading}
                className={`text-sm ${
                  countdown > 0
                    ? "text-muted-foreground cursor-not-allowed"
                    : "text-primary hover:underline"
                }`}
              >
                {countdown > 0 ? `Resend OTP in ${countdown}s` : "Resend OTP"}
              </button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-foreground">Reset Password</h2>
              <p className="text-sm text-muted-foreground mt-2">
                Enter your new password below
              </p>
            </div>
            <CommonForm
              formControls={passwordFormControls}
              buttonText={isLoading ? "Resetting..." : "Reset Password"}
              formData={passwordFormData}
              setFormData={setPasswordFormData}
              onSubmit={handleResetPassword}
              disabled={isLoading}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <Helmet>
        <title>Forgot Password - Shri Mahalaxmi Mobile</title>
        <meta
          name="description"
          content="Reset your Shri Mahalaxmi Mobile account password"
        />
      </Helmet>

      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center">
          <div className="mb-6 flex justify-center">
            <img
              src="/fav.png"
              className="h-24 w-24 object-contain"
              alt="Shri Mahalaxmi Mobile Logo"
            />
          </div>

          {renderStepContent()}

          <div className="mt-6 text-center">
            <Link
              to="/auth/login"
              className="text-sm text-primary hover:underline"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;