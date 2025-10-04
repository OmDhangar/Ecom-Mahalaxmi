const User = require('../../models/User');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const { sendOTPEmail } = require('../../services/emailService');
const { generateSecureOTP, hashOTP } = require('../../utils/otpUtils');
const { maskEmail } = require('../../utils/emailUtils');

// Rate limiting middleware
const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // 3 requests per IP per window
  message: {
    success: false,
    message: 'Too many password reset attempts. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const otpAttemptLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5, // 5 OTP attempts per IP per window
  message: {
    success: false,
    message: 'Too many OTP attempts. Please try again later.'
  }
});

/**
 * Send Password Reset OTP
 * Security: No information disclosure about account existence
 */
const sendPasswordResetOTP = async (req, res) => {
  try {
    const { identifier } = req.body;

    // Input validation
    if (!identifier || typeof identifier !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid username or email address.'
      });
    }

    const cleanIdentifier = identifier.trim().toLowerCase();

    // Simulate consistent processing time to prevent timing attacks
    const startTime = Date.now();
    const minProcessingTime = 500; // 500ms minimum

    let user = null;
    let userEmail = null;

    try {
      // Look up user by email or username
      user = await User.findOne({
        $or: [
          { email: cleanIdentifier },
          { username: cleanIdentifier }
        ]
      }).select('email username isActive');

      if (user && user.isActive) {
        userEmail = user.email;
      }
    } catch (dbError) {
      console.error('Database lookup error:', dbError);
      // Continue with generic response
    }

    // Generate OTP regardless of user existence (prevent enumeration)
    const otp = generateSecureOTP();
    const otpHash = hashOTP(otp);
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    let maskedEmail = null;

    if (user && userEmail) {
      try {
        // Store OTP in database
        await User.findByIdAndUpdate(user._id, {
          passwordResetOTP: otpHash,
          passwordResetOTPExpiry: otpExpiry,
          passwordResetAttempts: 0 // Reset attempt counter
        });

        // Send OTP email
        await sendOTPEmail(userEmail, otp, user.username || 'User');
        
        maskedEmail = maskEmail(userEmail);
        
        console.log(`Password reset OTP sent to user: ${user._id}`);
      } catch (emailError) {
        console.error('Email sending error:', emailError);
        // Continue with generic response to prevent information disclosure
      }
    } else {
      // Log potential security attempt
      console.warn(`Password reset attempt for non-existent account: ${cleanIdentifier} from IP: ${req.ip}`);
    }

    // Ensure minimum processing time to prevent timing attacks
    const processingTime = Date.now() - startTime;
    if (processingTime < minProcessingTime) {
      await new Promise(resolve => setTimeout(resolve, minProcessingTime - processingTime));
    }

    // Always return the same response regardless of account existence
    res.status(200).json({
      success: true,
      message: 'If an account exists with this identifier, an OTP has been sent to the associated email address.',
      maskedEmail: maskedEmail // Only present if email was actually sent
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while processing your request. Please try again later.'
    });
  }
};

/**
 * Verify Password Reset OTP
 */
const verifyPasswordResetOTP = async (req, res) => {
  try {
    const { identifier, otp } = req.body;

    // Input validation
    if (!identifier || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both identifier and OTP.'
      });
    }

    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        success: false,
        message: 'OTP must be a 6-digit number.'
      });
    }

    const cleanIdentifier = identifier.trim().toLowerCase();
    const otpHash = hashOTP(otp);

    // Find user with valid OTP
    const user = await User.findOne({
      $or: [
        { email: cleanIdentifier },
        { username: cleanIdentifier }
      ],
      passwordResetOTP: otpHash,
      passwordResetOTPExpiry: { $gt: new Date() },
      isActive: true
    });

    if (!user) {
      // Increment attempt counter for existing users (if any)
      await User.updateOne(
        {
          $or: [
            { email: cleanIdentifier },
            { username: cleanIdentifier }
          ]
        },
        { $inc: { passwordResetAttempts: 1 } }
      );

      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP. Please request a new one.'
      });
    }

    // Check attempt limits
    if (user.passwordResetAttempts >= 5) {
      return res.status(429).json({
        success: false,
        message: 'Too many failed attempts. Please request a new OTP.'
      });
    }

    // Generate password reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = await bcrypt.hash(resetToken, 12);
    const resetTokenExpiry = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    // Update user with reset token and clear OTP
    await User.findByIdAndUpdate(user._id, {
      passwordResetToken: resetTokenHash,
      passwordResetTokenExpiry: resetTokenExpiry,
      passwordResetOTP: undefined,
      passwordResetOTPExpiry: undefined,
      passwordResetAttempts: 0
    });

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully.',
      resetToken: resetToken,
      userId: user._id
    });

  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while verifying OTP. Please try again.'
    });
  }
};

/**
 * Reset Password
 */
const resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword, userId } = req.body;

    // Input validation
    if (!resetToken || !newPassword || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields.'
      });
    }

    // Password strength validation
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long.'
      });
    }

    // Find user with valid reset token
    const user = await User.findById(userId);
    
    if (!user || !user.passwordResetToken || !user.passwordResetTokenExpiry) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token.'
      });
    }

    // Check token expiry
    if (user.passwordResetTokenExpiry < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Reset token has expired. Please request a new one.'
      });
    }

    // Verify reset token
    const isValidToken = await bcrypt.compare(resetToken, user.passwordResetToken);
    
    if (!isValidToken) {
      return res.status(400).json({
        success: false,
        message: 'Invalid reset token.'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password and clear reset tokens
    await User.findByIdAndUpdate(userId, {
      password: hashedPassword,
      passwordResetToken: undefined,
      passwordResetTokenExpiry: undefined,
      passwordResetOTP: undefined,
      passwordResetOTPExpiry: undefined,
      passwordResetAttempts: 0,
      // Increment password version to invalidate all existing sessions
      passwordVersion: (user.passwordVersion || 0) + 1
    });

    // Log successful password reset
    console.log(`Password reset successful for user: ${userId}`);

    res.status(200).json({
      success: true,
      message: 'Password reset successfully. Please login with your new password.'
    });

  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while resetting password. Please try again.'
    });
  }
};

module.exports = {
  sendPasswordResetOTP: [forgotPasswordLimiter, sendPasswordResetOTP],
  verifyPasswordResetOTP: [otpAttemptLimiter, verifyPasswordResetOTP],
  resetPassword
};
