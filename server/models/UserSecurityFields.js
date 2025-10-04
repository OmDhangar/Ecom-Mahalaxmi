// Additional security fields for User model
// Add these fields to your existing User schema

const securityFields = {
  // Password Reset OTP
  passwordResetOTP: {
    type: String,
    select: false // Don't include in regular queries
  },
  passwordResetOTPExpiry: {
    type: Date,
    select: false
  },
  passwordResetAttempts: {
    type: Number,
    default: 0,
    select: false
  },
  
  // Password Reset Token (after OTP verification)
  passwordResetToken: {
    type: String,
    select: false
  },
  passwordResetTokenExpiry: {
    type: Date,
    select: false
  },
  
  // Password version for session invalidation
  passwordVersion: {
    type: Number,
    default: 0
  },
  
  // Account security
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Rate limiting fields
  lastPasswordResetRequest: {
    type: Date,
    select: false
  },
  passwordResetRequestCount: {
    type: Number,
    default: 0,
    select: false
  },
  
  // Security audit
  lastLoginIP: String,
  lastLoginAt: Date,
  failedLoginAttempts: {
    type: Number,
    default: 0
  },
  accountLockedUntil: Date
};

// Indexes for performance
const securityIndexes = [
  { passwordResetOTP: 1, passwordResetOTPExpiry: 1 },
  { passwordResetToken: 1, passwordResetTokenExpiry: 1 },
  { email: 1, isActive: 1 },
  { username: 1, isActive: 1 },
  { lastPasswordResetRequest: 1 }
];

module.exports = {
  securityFields,
  securityIndexes
};
